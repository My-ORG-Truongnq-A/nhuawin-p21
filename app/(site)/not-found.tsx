import { NotFoundContent } from "@/components/layout/NotFoundContent";

/** notFound() gọi trong trang của site (vd bài không tồn tại) → 404 trong layout site. */
export default function NotFound() {
  return <NotFoundContent />;
}
