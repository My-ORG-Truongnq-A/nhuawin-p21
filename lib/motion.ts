/**
 * Quy chuẩn chuyển động (GD-04). Thời lượng / easing nằm ở styles/tokens.css (--motion-*, --ease-out).
 */

/** Kích hoạt reveal khi phần tử còn cách đáy viewport ~25 % (không dùng -12 %: cuộn nhanh gặp khoảng trắng). */
export const REVEAL_ROOT_MARGIN = "0px 0px 25% 0px";

/**
 * Script ES5 inline trong <head>, chạy trước first paint: gắn class `js` để CSS ẩn phần tử chờ reveal.
 * Đường lui: 3 s sau `load` mà observer chưa chạy → gỡ `js` để nội dung luôn hiện.
 */
export const MOTION_BOOT_SCRIPT =
  "(function(d,w){var h=d.documentElement;h.classList.add('js');" +
  "w.addEventListener('load',function(){setTimeout(function(){if(!w.__revealReady){h.classList.remove('js');}},3000);});" +
  "})(document,window);";
