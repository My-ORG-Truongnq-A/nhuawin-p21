import { useState } from "react";
import type { DocumentActionComponent, DocumentActionProps } from "sanity";
import { isSingleton, SINGLETON_ACTIONS } from "./singletons";

/**
 * Quyền thao tác hạn chế trong Studio (content_model documentActions, CM-13).
 * - Singleton: chỉ publish / discardChanges / restore.
 * - productGroup / application: không nhân bản.
 * - post có URL cũ: gỡ xuất bản phải xác nhận cảnh báo 404.
 * - Xoá category / productGroup khi còn tham chiếu: Sanity chặn sẵn vì reference mạnh.
 */

export const LEGACY_UNPUBLISH_WARNING = "URL cũ sẽ trả 404 — thêm luật chuyển hướng trước.";

const NO_DUPLICATE = new Set(["productGroup", "application"]);

type ActionLike = { action?: string };

/** Lọc / bọc action theo loại tài liệu — thuần, test được. */
export function resolveDocumentActions<A extends ActionLike>(
  prev: A[],
  schemaType: string,
  wrapUnpublish: (a: A) => A = (a) => a,
): A[] {
  if (isSingleton(schemaType)) return prev.filter((a) => a.action && SINGLETON_ACTIONS.has(a.action));
  if (NO_DUPLICATE.has(schemaType)) return prev.filter((a) => a.action !== "duplicate");
  if (schemaType === "post") return prev.map((a) => (a.action === "unpublish" ? wrapUnpublish(a) : a));
  return prev;
}

/** Bọc action "unpublish": bài có legacy.path phải qua hộp xác nhận cảnh báo trước. */
export function withLegacyUnpublishWarning(original: DocumentActionComponent): DocumentActionComponent {
  function LegacyUnpublishAction(props: DocumentActionProps) {
    const [confirming, setConfirming] = useState(false);
    const desc = original(props);
    const legacyPath = (props.published as { legacy?: { path?: string } } | null)?.legacy?.path;
    if (!desc || !legacyPath) return desc;
    return {
      ...desc,
      onHandle: () => setConfirming(true),
      dialog: confirming
        ? {
            type: "confirm" as const,
            tone: "critical" as const,
            message: `${legacyPath}: ${LEGACY_UNPUBLISH_WARNING}`,
            confirmButtonText: "Vẫn gỡ xuất bản",
            onCancel: () => setConfirming(false),
            onConfirm: () => {
              setConfirming(false);
              desc.onHandle?.();
            },
          }
        : desc.dialog,
    };
  }
  LegacyUnpublishAction.action = original.action;
  return LegacyUnpublishAction;
}
