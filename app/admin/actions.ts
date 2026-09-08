"use server";

import { redirect } from "next/navigation";
import {
  actionFailed,
  actionOk,
  describeError,
  type ActionResult,
} from "@/lib/admin/actions-result";
import { assertCanWrite } from "@/lib/admin/guard";
import { importDemoCatalogue } from "@/lib/admin/import-demo";
import { revalidateAdmin, revalidateStorefront } from "@/lib/admin/revalidate";
import {
  hasFieldErrors,
  validateProductInput,
} from "@/lib/admin/product-validation";
import {
  adminSettingsRepository,
  requireAdminProductRepository,
} from "@/lib/repositories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/types";
import type { ProductInput } from "@/types/admin";

/* -------------------------------------------------------------------------- *
 * Products
 * -------------------------------------------------------------------------- */

export async function saveProductAction(
  id: string | null,
  input: ProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await assertCanWrite();

    const fieldErrors = validateProductInput(input);
    if (hasFieldErrors(fieldErrors)) {
      return actionFailed("Please fix the highlighted fields.", fieldErrors);
    }

    const repo = requireAdminProductRepository();

    if (!(await repo.isSlugAvailable(input.slug, id ?? undefined))) {
      return actionFailed("Please fix the highlighted fields.", {
        slug: 'Another product already uses "' + input.slug + '".',
      });
    }

    const saved = id ? await repo.update(id, input) : await repo.create(input);

    revalidateStorefront(saved.slug);
    revalidateAdmin(saved.id);

    return actionOk(
      { id: saved.id, slug: saved.slug },
      id ? "Changes saved." : "Product created.",
    );
  } catch (error) {
    return actionFailed(describeError(error, "Could not save the product."));
  }
}

export async function setProductStatusAction(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  try {
    await assertCanWrite();

    const repo = requireAdminProductRepository();
    await repo.setStatus(id, status);

    const product = await repo.getById(id);
    revalidateStorefront(product?.slug);
    revalidateAdmin(id);

    const words: Record<ProductStatus, string> = {
      active: "Product is live.",
      draft: "Product moved to drafts — it is no longer on the site.",
      archived: "Product archived.",
    };

    return actionOk(undefined, words[status]);
  } catch (error) {
    return actionFailed(describeError(error, "Could not change the status."));
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await assertCanWrite();

    const repo = requireAdminProductRepository();
    const product = await repo.getById(id);
    await repo.remove(id);

    revalidateStorefront(product?.slug);
    revalidateAdmin();

    return actionOk(undefined, "Product deleted.");
  } catch (error) {
    return actionFailed(describeError(error, "Could not delete the product."));
  }
}

export async function importDemoCatalogueAction(): Promise<
  ActionResult<{ products: number; categories: number }>
> {
  try {
    const access = await assertCanWrite();

    if (access.mode !== "supabase") {
      return actionFailed(
        "There is nothing to import into — demo mode already has the demo catalogue.",
      );
    }

    const result = await importDemoCatalogue();

    revalidateStorefront();
    revalidateAdmin();

    return actionOk(
      result,
      "Imported " +
        result.products +
        " products and " +
        result.categories +
        " categories.",
    );
  } catch (error) {
    return actionFailed(describeError(error, "Could not import the catalogue."));
  }
}

/* -------------------------------------------------------------------------- *
 * Settings
 * -------------------------------------------------------------------------- */

export async function saveLogoAction(
  logoUrl: string | null,
): Promise<ActionResult> {
  try {
    await assertCanWrite();

    if (!adminSettingsRepository) {
      return actionFailed("No writable backend is configured.");
    }

    await adminSettingsRepository.update({ logoUrl: logoUrl ?? undefined });

    revalidateStorefront();
    revalidateAdmin();

    return actionOk(undefined, logoUrl ? "Logo updated." : "Logo removed.");
  } catch (error) {
    return actionFailed(describeError(error, "Could not save the logo."));
  }
}

/* -------------------------------------------------------------------------- *
 * Authentication
 * -------------------------------------------------------------------------- */

export async function signInAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return actionFailed(
      "Authentication is not configured. Connect Supabase to enable sign-in.",
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    // Deliberately vague: saying which half was wrong tells an attacker
    // whether an address has an account.
    return actionFailed("That email and password combination is not recognised.");
  }

  // Signing in is not the same as being an admin.
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return actionFailed(
      "That account is not an administrator of this store.",
    );
  }

  return actionOk(undefined, "Signed in.");
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
