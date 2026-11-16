/**
 * SINH TỰ ĐỘNG từ bản crawl web cũ https://www.nhuawinvietnam.com.vn (16/11/2026) — không sửa tay.
 * Ảnh: bản 1200 px webp trong public/images/seed/ (quyền dùng chờ khách xác nhận — MI-10).
 * Dùng làm seed dự phòng của cửa nội dung; nguồn sự thật là Sanity sau khi nhập seed (T3.5).
 */
import type { ImageRef, RichText, SpecRow } from "@/lib/content/types";

type CrawlImage = ImageRef & { caption?: string };

export const CRAWL_POSTS = [
  {
    "slug": "cach-chon-do-day-tam-fomex",
    "title": "Cách chọn độ dày tấm Fomex cho từng hạng mục",
    "excerpt": "Độ dày quyết định độ cứng, trọng lượng, cách gia công và giá thành. Bảng chọn nhanh theo hạng mục và ba yếu tố cần cân nhắc trước khi đặt hàng.",
    "publishedAt": "2026-09-22",
    "image": {
      "url": "/images/seed/8c3b2e3a16.webp",
      "width": 1200,
      "height": 896,
      "alt": "Mặt cắt các tấm Fomex nhiều độ dày xếp cạnh nhau"
    },
    "categorySlug": "chon-gia-cong",
    "seoDescription": "Hướng dẫn chọn độ dày tấm Fomex 3 – 18 ly cho decal, backdrop, hashtag, biển quảng cáo, nội thất và chữ nổi. Phân biệt độ dày danh nghĩa (ly) và độ dày thực tế.",
    "body": [
      {
        "_type": "block",
        "_key": "k1",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k0",
            "text": "Cùng là tấm Fomex nhưng tấm 3 ly và tấm 18 ly phục vụ hai nhóm việc hoàn toàn khác nhau. Chọn mỏng quá thì mảng in bị võng, cầm bị oằn; chọn dày quá thì nặng, khó cắt và đội chi phí. Bài viết tóm tắt cách WIN tư vấn độ dày cho khách hàng theo từng hạng mục.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k3",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2",
            "text": "Độ dày danh nghĩa và độ dày thực tế",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k5",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4",
            "text": "Thị trường gọi Fomex theo “ly” (3 ly, 5 ly…), đó là độ dày danh nghĩa. Độ dày thực tế của tấm có thể thấp hơn và được phân biệt bằng “thiếu”, “đủ” — ví dụ ở WIN, Fomex 3 ly thiếu dày 2,4 mm, 3 ly đủ dày 2,7 mm. Khi so sánh báo giá giữa các nhà cung cấp, hãy so theo độ dày thực tế, không chỉ theo tên gọi.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k8",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6",
            "text": "Đo độ dày:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k7",
            "text": " dùng thước kẹp đo ở 4 góc và giữa tấm, lấy giá trị trung bình.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "kb",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k9",
            "text": "Cân thử:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "ka",
            "text": " cân một tấm nguyên khổ; cùng độ dày, tấm nặng hơn thường cứng hơn và mặt in đẹp hơn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "ke",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "kc",
            "text": "Hỏi rõ loại tấm:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "kd",
            "text": " nói rõ “5 ly thiếu 3,8 mm” hay “5 ly đủ 4,7 mm” để chữ cắt CNC, chi tiết lắp ghép khớp nhau.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "kg",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "kf",
            "text": "Bảng chọn nhanh theo hạng mục",
            "marks": []
          }
        ]
      },
      {
        "_type": "table",
        "_key": "ko",
        "rows": [
          {
            "_type": "tableRow",
            "_key": "kh",
            "cells": [
              "Hạng mục",
              "Độ dày gợi ý",
              "Ghi chú"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "ki",
            "cells": [
              "Cắt dán decal, biển bảng, chân quảng cáo",
              "3 ly",
              "Nhẹ, rọc dao được, tiết kiệm chi phí"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "kj",
            "cells": [
              "Decor sinh nhật, tiệc cưới, background",
              "3 – 5 ly",
              "3 ly cho mảng phụ, 5 ly cho mảng chính"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "kk",
            "cells": [
              "Decor trang trí, backdrop sự kiện",
              "5 – 10 ly",
              "Khung lớn nên dùng tấm dày hơn để giữ phẳng"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "kl",
            "cells": [
              "Hashtag, bảng check-in cầm tay",
              "8 – 10 ly",
              "Đủ cứng khi cầm, mép cắt CNC gọn"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "km",
            "cells": [
              "Nội ngoại thất, tủ kệ, vách",
              "8 – 18 ly",
              "Bắt vít, dán cạnh như ván gỗ công nghiệp"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "kn",
            "cells": [
              "Chân chữ, chữ nổi, logo",
              "15 – 18 ly",
              "Độ dày tạo chiều sâu cho chữ"
            ]
          }
        ]
      },
      {
        "_type": "block",
        "_key": "kq",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "kp",
            "text": "Ba yếu tố quyết định độ dày",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "kt",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "kr",
            "text": "Kích thước mảng và khung đỡ:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "ks",
            "text": " mảng càng lớn, khung càng thưa thì tấm càng phải dày để giữ phẳng. Backdrop có thanh khung dày dùng Fomex 5 ly là đủ; khung thưa nên lên 8 ly.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "kw",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "ku",
            "text": "Môi trường và thời gian sử dụng:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "kv",
            "text": " hạng mục trong nhà, ngắn ngày dùng tấm mỏng; biển ngoài trời dùng lâu nên chọn từ 5 ly trở lên để chịu gió, nắng.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "kz",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "kx",
            "text": "Cách gia công:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "ky",
            "text": " tấm 3 – 5 ly rọc dao được; tấm dày hơn cần CNC, cưa bàn — tính cả chi phí gia công khi chọn độ dày.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k11",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k10",
            "text": "Sai lầm thường gặp",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k13",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k12",
            "text": "Dùng tấm mỏng cho mảng backdrop lớn không có khung đỡ — tấm võng, mặt in gợn sóng dưới đèn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k15",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k14",
            "text": "Dùng tấm dày cho chữ cắt decal đơn giản — tăng trọng lượng, tăng chi phí mà không thêm giá trị.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k17",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k16",
            "text": "So giá theo “ly” mà không kiểm tra độ dày thực tế.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1b",
        "style": "blockquote",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k18",
            "text": "Chưa chắc nên chọn độ dày nào?",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k1a",
            "text": "\n",
            "marks": []
          },
          {
            "_type": "span",
            "_key": "k19",
            "text": "Gửi kích thước, cách lắp và thời gian sử dụng của hạng mục — WIN gợi ý độ dày phù hợp và hỗ trợ thử mẫu trước khi đặt hàng số lượng lớn.",
            "marks": []
          }
        ]
      }
    ]
  },
  {
    "slug": "in-uv-va-dan-decal-len-tam-fomex",
    "title": "Kinh nghiệm in UV và dán decal lên tấm Fomex",
    "excerpt": "Chuẩn bị bề mặt, thiết lập máy in UV, quy trình dán decal không bọt khí và bảng xử lý các lỗi hay gặp khi in trên Fomex.",
    "publishedAt": "2026-09-15",
    "image": {
      "url": "/images/seed/4565786575.webp",
      "width": 1200,
      "height": 896,
      "alt": "Máy in UV phẳng in hoạ tiết hình học nhiều màu trực tiếp lên tấm Fomex"
    },
    "categorySlug": "chon-gia-cong",
    "seoDescription": "Kinh nghiệm in UV trực tiếp và dán decal lên tấm Fomex: chuẩn bị bề mặt, thiết lập máy in, dán decal không bọt khí, xử lý lỗi mực bong và mép decal.",
    "body": [
      {
        "_type": "block",
        "_key": "k1d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1c",
            "text": "Bề mặt trắng, phẳng và mịn là lý do Fomex trở thành vật liệu nền quen thuộc của xưởng in quảng cáo. Để bản in sắc nét và bền màu, khâu chuẩn bị tấm và thao tác in, dán quan trọng không kém chất lượng tấm.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k1f",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1e",
            "text": "Chuẩn bị bề mặt",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k1h",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1g",
            "text": "Để tấm trong xưởng in vài giờ cho cân bằng nhiệt độ trước khi in, nhất là tấm vừa chuyển từ kho nóng hoặc lạnh.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1j",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1i",
            "text": "Lau sạch bụi bằng khăn mềm, hơi ẩm; với bụi tĩnh điện có thể lau nhẹ bằng cồn loãng rồi để khô.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1l",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1k",
            "text": "Không chạm tay trần lên mặt in — dầu trên tay làm mực UV và keo decal bám kém.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1n",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1m",
            "text": "Xếp tấm nằm phẳng; không in lên tấm đang bị cong do dựng đứng lâu ngày.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1p",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1o",
            "text": "In UV trực tiếp",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k1s",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1q",
            "text": "Chiều cao đầu phun:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k1r",
            "text": " đặt theo độ dày thực tế của tấm (vd 2,4 mm hay 2,7 mm), không theo tên gọi “3 ly”, để tránh quệt đầu phun.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1v",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1t",
            "text": "Lớp lót trắng:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k1u",
            "text": " nền Fomex đã trắng nên thường không cần in lót, trừ khi cần độ phủ màu đặc biệt.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k1y",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1w",
            "text": "Sấy đèn:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k1x",
            "text": " kiểm tra công suất đèn UV; mực chưa khô hoàn toàn sẽ bong khi cào hoặc khi dán băng keo.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k21",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k1z",
            "text": "In thử:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k20",
            "text": " chạy thử trên một mẩu tấm cùng lô trước khi in cả đơn để chỉnh màu và chế độ in.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k23",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k22",
            "text": "Với hạng mục ngoài trời, in UV cho màu bền hơn dưới nắng so với nhiều phương pháp khác; có thể phủ thêm lớp bóng hoặc mờ để tăng độ bền.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k25",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k24",
            "text": "Quy trình dán decal",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k27",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k26",
            "text": "Cắt decal dư mỗi cạnh 1 – 2 cm so với tấm.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k29",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k28",
            "text": "Bóc một đầu giấy đế khoảng 5 – 10 cm, căn thẳng cạnh rồi dán cố định đầu này.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k2b",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2a",
            "text": "Vừa rút giấy đế vừa gạt từ giữa ra hai bên, lực gạt đều tay.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k2d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2c",
            "text": "Bọt khí còn sót: dùng kim châm một lỗ nhỏ rồi miết phẳng.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k2f",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2e",
            "text": "Rọc decal thừa sát cạnh tấm bằng dao sắc, lưỡi nghiêng theo cạnh.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k2h",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2g",
            "text": "Lỗi thường gặp và cách xử lý",
            "marks": []
          }
        ]
      },
      {
        "_type": "table",
        "_key": "k2n",
        "rows": [
          {
            "_type": "tableRow",
            "_key": "k2i",
            "cells": [
              "Hiện tượng",
              "Nguyên nhân thường gặp",
              "Cách xử lý"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k2j",
            "cells": [
              "Mực bong khi cào",
              "Bụi, dầu tay trên bề mặt; đèn UV yếu",
              "Vệ sinh tấm trước khi in; kiểm tra đèn sấy"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k2k",
            "cells": [
              "Bọt khí dưới decal",
              "Gạt không đều, gạt từ mép vào",
              "Gạt từ giữa ra; dán ướt với mảng lớn"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k2l",
            "cells": [
              "Mép decal bong",
              "Rọc quá sát, mép tấm còn bụi",
              "Lau sạch cạnh; dán vòng qua cạnh tấm"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k2m",
            "cells": [
              "Màu nền lệch giữa các tấm",
              "Tấm khác lô sản xuất",
              "Đặt cùng một lô cho một công trình"
            ]
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k2r",
        "style": "blockquote",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2o",
            "text": "Mẹo đặt hàng",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k2q",
            "text": "\n",
            "marks": []
          },
          {
            "_type": "span",
            "_key": "k2p",
            "text": "Với công trình nhiều tấm ghép, hãy đặt toàn bộ số tấm trong cùng một lô sản xuất để nền trắng đồng đều giữa các mảng.",
            "marks": []
          }
        ]
      }
    ]
  },
  {
    "slug": "nhap-fomex-so-luong-lon-cho-dai-ly",
    "title": "Kinh nghiệm nhập Fomex số lượng lớn cho đại lý vật liệu",
    "excerpt": "Cơ cấu độ dày tồn kho, tiêu chí kiểm hàng khi nhận, cách lưu kho để tấm không cong vênh và cách làm việc với nhà máy để chủ động nguồn hàng.",
    "publishedAt": "2026-09-08",
    "image": {
      "url": "/images/seed/183f540afc.webp",
      "width": 1200,
      "height": 670,
      "alt": "Đoàn xe tải chở tấm Fomex xuất xưởng"
    },
    "categorySlug": "danh-cho-dai-ly",
    "seoDescription": "Kinh nghiệm nhập tấm Fomex số lượng lớn cho đại lý vật liệu quảng cáo: cơ cấu độ dày tồn kho, kiểm hàng theo kẹp, lưu kho và lập kế hoạch nhập hàng với nhà máy.",
    "body": [
      {
        "_type": "block",
        "_key": "k2t",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2s",
            "text": "Với đại lý vật liệu quảng cáo, Fomex là mặt hàng xoay vòng nhanh nhưng chiếm nhiều diện tích kho. Nhập đúng cơ cấu, kiểm hàng kỹ và lưu kho đúng cách giúp giảm hàng tồn, hạn chế hàng lỗi và giữ uy tín với xưởng in.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k2v",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2u",
            "text": "Cơ cấu độ dày tồn kho",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k2y",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2w",
            "text": "Fomex 3 ly:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k2x",
            "text": " nhóm bán nhanh nhất, phục vụ decal, biển bảng, decor sự kiện — nên luôn có hàng sẵn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k31",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k2z",
            "text": "Fomex 5 ly:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k30",
            "text": " phục vụ backdrop, decor; nhu cầu tăng mạnh theo mùa cưới, khai trương, cuối năm.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k34",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k32",
            "text": "Fomex 8 – 18 ly:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k33",
            "text": " chủ yếu theo đơn nội thất, chữ nổi — nhập theo dự án hoặc giữ tồn ở mức tối thiểu.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k36",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k35",
            "text": "Tiêu chí kiểm hàng khi nhận",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k38",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k37",
            "text": "Độ dày thực tế: đo bằng thước kẹp ở 4 góc và giữa tấm, đối chiếu với độ dày của từng loại trong bảng quy cách.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3a",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k39",
            "text": "Số tấm mỗi kẹp: đếm theo quy cách đóng kẹp — ví dụ 15 tấm/kẹp với Fomex 3 ly, 5 tấm/kẹp với 8 – 10 ly.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3c",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3b",
            "text": "Khổ tấm và độ vuông góc: đo hai đường chéo, chênh lệch nhỏ là tấm cắt vuông.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3e",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3d",
            "text": "Bề mặt: phẳng, không rỗ, không sọc, không ố vàng; hai mặt đồng màu.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3g",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3f",
            "text": "Đóng kẹp: góc kẹp không móp, màng lót bề mặt còn nguyên.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3i",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3h",
            "text": "Lưu kho đúng cách",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k3k",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3j",
            "text": "Kê tấm nằm phẳng trên pallet; không dựng đứng hoặc gác nghiêng lâu ngày.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3m",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3l",
            "text": "Tránh nắng chiếu trực tiếp và nguồn nhiệt như mái tôn nóng, đèn công suất lớn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3o",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3n",
            "text": "Xếp theo loại tấm và lô sản xuất; xuất trước những lô nhập trước.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3q",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3p",
            "text": "Giữ nguyên lớp lót bề mặt đến khi giao cho xưởng in để tránh trầy xước.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3s",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3r",
            "text": "Làm việc với nhà máy",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k3v",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3t",
            "text": "Lập kế hoạch theo mùa:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k3u",
            "text": " chốt sản lượng trước các đợt cao điểm để nhà máy chủ động lịch sản xuất.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k3y",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3w",
            "text": "Thống nhất quy cách:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k3x",
            "text": " đặt hàng theo tên loại và độ dày thực tế (vd 5 ly thiếu 3,8 mm hay 5 ly đủ 4,7 mm) — tránh hiểu nhầm khi chỉ nói “5 ly”.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k41",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k3z",
            "text": "Một đầu mối:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k40",
            "text": " có người phụ trách tại nhà máy để xử lý nhanh khi có phát sinh về giao nhận, chất lượng.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k45",
        "style": "blockquote",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k42",
            "text": "Chính sách cho đại lý",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k44",
            "text": "\n",
            "marks": []
          },
          {
            "_type": "span",
            "_key": "k43",
            "text": "WIN có chính sách hợp tác riêng cho nhà phân phối và đại lý vật liệu, nguồn hàng sản xuất trong nước, giao hàng toàn quốc. Gửi nhu cầu để nhận báo giá theo sản lượng.",
            "marks": []
          }
        ]
      }
    ]
  },
  {
    "slug": "tam-fomex-la-gi",
    "title": "Tấm Fomex là gì? Cấu tạo, đặc tính và ứng dụng",
    "excerpt": "Fomex là tên gọi phổ biến của tấm nhựa PVC foam — nhẹ, không thấm nước, dễ in, dễ gia công. Tìm hiểu cấu tạo, ưu điểm, giới hạn và các ứng dụng chính.",
    "publishedAt": "2026-08-25",
    "image": {
      "url": "/images/seed/a4c828c9ee.webp",
      "width": 1200,
      "height": 896,
      "alt": "Bộ mẫu tấm Fomex WIN theo độ dày"
    },
    "categorySlug": "kien-thuc-vat-lieu",
    "seoDescription": "Tấm Fomex (tấm nhựa PVC foam) là gì? Cấu tạo, đặc tính, ưu nhược điểm và ứng dụng trong quảng cáo, sự kiện, nội thất. Quy cách tấm Fomex WIN 3 – 18 ly.",
    "body": [
      {
        "_type": "block",
        "_key": "k47",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k46",
            "text": "Fomex là cách gọi quen thuộc ở Việt Nam của tấm nhựa PVC foam (còn gọi là tấm nhựa bọt, ván nhựa Formex). Nhờ nhẹ, không thấm nước và dễ in, Fomex được dùng rộng rãi trong quảng cáo, trang trí sự kiện và ngày càng nhiều trong nội thất thay cho gỗ, MDF.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k49",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k48",
            "text": "Cấu tạo",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k4b",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4a",
            "text": "Tấm được đùn từ hỗn hợp nhựa PVC, chất tạo bọt và phụ gia ổn định. Trong quá trình đùn, chất tạo bọt tạo ra các bọt khí li ti bên trong lõi; hai mặt tấm được làm nguội và cán phẳng thành bề mặt nhẵn, mịn. Cấu trúc này giúp tấm nhẹ mà vẫn cứng.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k4d",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4c",
            "text": "Đặc tính nổi bật",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k4g",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4e",
            "text": "Nhẹ:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k4f",
            "text": " nhẹ hơn gỗ và MDF cùng độ dày, thuận tiện vận chuyển, thi công trên cao.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4j",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4h",
            "text": "Không thấm nước:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k4i",
            "text": " không mục, không trương nở khi gặp ẩm; không bị mối mọt.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4m",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4k",
            "text": "Bề mặt in đẹp:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k4l",
            "text": " nền trắng phẳng cho bản in UV sắc nét, decal bám chắc.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4p",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4n",
            "text": "Dễ gia công:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k4o",
            "text": " cắt, khoan, phay CNC, uốn nhiệt, dán keo, bắt vít.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4r",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4q",
            "text": "Giới hạn cần biết",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k4t",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4s",
            "text": "Nhựa PVC mềm dần khi gặp nhiệt độ cao — không lắp sát nguồn nhiệt, bóng đèn công suất lớn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4v",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4u",
            "text": "Dùng ngoài trời lâu dài dưới nắng gắt, bề mặt có thể ngả màu theo thời gian; nên in UV, phủ bảo vệ và chọn tấm dày.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4x",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4w",
            "text": "Chịu tải thấp hơn gỗ đặc cùng độ dày — kệ, mặt bàn nhịp dài cần thêm thanh đỡ.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k4z",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k4y",
            "text": "Ứng dụng phổ biến",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k52",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k50",
            "text": "Quảng cáo:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k51",
            "text": " biển bảng, standee, chân quảng cáo, chữ nổi, logo.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k55",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k53",
            "text": "Sự kiện:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k54",
            "text": " backdrop sinh nhật, tiệc cưới, khai trương; hashtag, bảng check-in.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k58",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k56",
            "text": "Nội ngoại thất:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k57",
            "text": " tủ bếp, tủ lavabo, vách ngăn, ốp tường, kệ trang trí.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k5b",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k59",
            "text": "Mô hình:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k5a",
            "text": " sa bàn kiến trúc, mô hình trưng bày, đạo cụ sân khấu.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k5d",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5c",
            "text": "Quy cách tấm Fomex WIN",
            "marks": []
          }
        ]
      },
      {
        "_type": "table",
        "_key": "k5k",
        "rows": [
          {
            "_type": "tableRow",
            "_key": "k5e",
            "cells": [
              "Thông số",
              "Giá trị"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5f",
            "cells": [
              "Nguyên liệu",
              "Nhựa PVC, chất tạo bọt và phụ gia ổn định"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5g",
            "cells": [
              "Độ dày",
              "3 – 18 ly (thực tế 2,4 – 17 mm), 14 loại"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5h",
            "cells": [
              "Kích thước tấm",
              "1220 × 2440 mm — linh hoạt kích thước và độ dày theo yêu cầu"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5i",
            "cells": [
              "Đóng kiện",
              "2 – 15 tấm/kẹp tuỳ độ dày"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5j",
            "cells": [
              "Màu sắc",
              "Trắng"
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "cach-cat-va-gia-cong-tam-fomex",
    "title": "Cắt và gia công tấm Fomex gọn mép, không vỡ cạnh",
    "excerpt": "Chọn dụng cụ theo độ dày, thao tác rọc dao, cắt CNC, laser, cưa bàn đúng cách và hoàn thiện mép cắt — kèm lưu ý an toàn khi gia công.",
    "publishedAt": "2026-08-11",
    "image": {
      "url": "/images/seed/b6272bba04.webp",
      "width": 1200,
      "height": 896,
      "alt": "Máy CNC phay hoa văn hình học trên tấm Fomex dày"
    },
    "categorySlug": "chon-gia-cong",
    "seoDescription": "Cách cắt tấm Fomex không vỡ mép: chọn dụng cụ theo độ dày (dao rọc, CNC, laser, cưa bàn), thao tác từng bước, hoàn thiện cạnh và lưu ý an toàn.",
    "body": [
      {
        "_type": "block",
        "_key": "k5m",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5l",
            "text": "Fomex dễ cắt hơn gỗ và mica, nhưng chọn sai dụng cụ hoặc thao tác vội vẫn làm mép tấm sứt, sần hoặc cháy. Nguyên tắc chung: dụng cụ phải sắc, tốc độ cắt đều và phương pháp phù hợp với độ dày.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k5o",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5n",
            "text": "Chọn dụng cụ theo độ dày",
            "marks": []
          }
        ]
      },
      {
        "_type": "table",
        "_key": "k5u",
        "rows": [
          {
            "_type": "tableRow",
            "_key": "k5p",
            "cells": [
              "Độ dày",
              "Dụng cụ phù hợp",
              "Lưu ý"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5q",
            "cells": [
              "3 – 5 ly",
              "Dao rọc giấy, dao cắt chuyên dụng",
              "Rạch nhiều lượt nhẹ rồi bẻ"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5r",
            "cells": [
              "5 – 10 ly",
              "CNC, cưa bàn, cưa lọng",
              "Lưỡi cưa răng mịn"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5s",
            "cells": [
              "15 – 18 ly",
              "CNC, cưa bàn trượt",
              "Cắt 2 lượt với tấm dày"
            ]
          },
          {
            "_type": "tableRow",
            "_key": "k5t",
            "cells": [
              "Chi tiết nhỏ, chữ",
              "CNC hoặc laser",
              "Laser giảm công suất, tăng tốc độ"
            ]
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k5w",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5v",
            "text": "Rọc dao với tấm mỏng",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k5y",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5x",
            "text": "Kê tấm trên mặt bàn phẳng, đánh dấu đường cắt bằng bút chì hoặc bút lông dầu.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k60",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k5z",
            "text": "Đặt thước kim loại dọc đường cắt, giữ chắc thước.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k62",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k61",
            "text": "Rạch nhẹ 2 – 3 lượt theo thước — không cố cắt đứt ngay từ lượt đầu.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k64",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k63",
            "text": "Đưa đường rạch ra mép bàn và bẻ nhẹ dứt khoát; rọc nốt lớp mặt còn lại nếu cần.",
            "marks": []
          }
        ],
        "listItem": "number",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k66",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k65",
            "text": "CNC, laser và cưa bàn",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k69",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k67",
            "text": "CNC:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k68",
            "text": " dùng dao phay một me cho nhựa, cố định tấm bằng bàn hút chân không hoặc kẹp; tốc độ chạy dao đều để phoi thoát tốt, mép không chảy.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6c",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6a",
            "text": "Laser:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k6b",
            "text": " phù hợp chi tiết nhỏ trên tấm mỏng; giảm công suất, tăng tốc độ để mép không cháy vàng, làm việc ở nơi có hút khói.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6f",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6d",
            "text": "Cưa bàn, cưa lọng:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k6e",
            "text": " chọn lưỡi răng mịn, đẩy tấm với tốc độ ổn định, không ép nhanh để tránh răng cưa mép cắt.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6h",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6g",
            "text": "Hoàn thiện sau khi cắt",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k6j",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6i",
            "text": "Chà mép bằng giấy nhám mịn hoặc máy mài để loại bỏ phần sần.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6l",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6k",
            "text": "Ghép tấm bằng keo dán PVC chuyên dụng; ép giữ đến khi keo khô.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6n",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6m",
            "text": "Hoàn thiện bằng sơn phủ, in UV, dán decal hoặc dán nẹp cạnh.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k6r",
        "style": "blockquote",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6o",
            "text": "An toàn khi gia công",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k6q",
            "text": "\n",
            "marks": []
          },
          {
            "_type": "span",
            "_key": "k6p",
            "text": "Đeo kính bảo hộ và khẩu trang khi cắt, chà nhám. Khi cắt CNC, laser, làm việc ở nơi thông thoáng hoặc có hệ thống hút bụi, hút khói.",
            "marks": []
          }
        ]
      }
    ]
  },
  {
    "slug": "dung-tam-fomex-ngoai-troi",
    "title": "Dùng tấm Fomex ngoài trời: chọn tấm, lắp đặt và bảo quản",
    "excerpt": "Biển và hạng mục ngoài trời cần tấm đủ dày, bản in bền nắng và cách lắp chịu gió. Những lưu ý để công trình Fomex ngoài trời bền đẹp.",
    "publishedAt": "2026-07-28",
    "image": {
      "url": "/images/seed/58cb260fde.webp",
      "width": 1200,
      "height": 670,
      "alt": "Sân nhà máy WIN, kiện tấm Fomex chờ xuất hàng"
    },
    "categorySlug": "chon-gia-cong",
    "seoDescription": "Lưu ý khi dùng tấm Fomex cho biển quảng cáo và công trình ngoài trời: chọn độ dày từ 5 ly, in UV, lắp đặt chịu gió, khe giãn nở, vệ sinh và kiểm tra định kỳ.",
    "body": [
      {
        "_type": "block",
        "_key": "k6t",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6s",
            "text": "Fomex không thấm nước nên dùng được cho nhiều hạng mục ngoài trời. Tuy vậy nắng, gió và chênh lệch nhiệt độ ngày đêm là thử thách lớn hơn nhiều so với trong nhà — chọn tấm và lắp đặt đúng cách quyết định công trình bền được bao lâu.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k6v",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6u",
            "text": "Chọn độ dày",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k6x",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6w",
            "text": "Biển quảng cáo và hạng mục ngoài trời nên dùng tấm từ 5 ly trở lên. Tấm dày cứng hơn, chịu gió tốt hơn và ít võng khi nhiệt độ thay đổi. Mảng lớn hoặc vị trí lộng gió nên dùng 8 – 10 ly và có khung đỡ.",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k6z",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k6y",
            "text": "In và bảo vệ bề mặt",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k71",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k70",
            "text": "Ưu tiên in UV: mực bám tốt, hình ảnh sắc nét và giữ màu lâu hơn dưới nắng.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k73",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k72",
            "text": "Có thể phủ thêm lớp bảo vệ chống UV để hạn chế phai màu và ngả màu bề mặt.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k75",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k74",
            "text": "Với decal, chọn loại decal ngoài trời và dán vòng qua cạnh tấm để mép không bong khi mưa.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k77",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k76",
            "text": "Lắp đặt chịu gió",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k7a",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k78",
            "text": "Khung đỡ:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k79",
            "text": " dùng khung sắt hộp hoặc nhôm, khoảng cách thanh khung dày hơn so với lắp trong nhà.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7d",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7b",
            "text": "Liên kết:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k7c",
            "text": " bắt vít qua lỗ khoan mồi kèm long đen, hoặc keo chịu lực ngoài trời — kết hợp cả hai với mảng lớn.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7g",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7e",
            "text": "Khe giãn nở:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k7f",
            "text": " chừa khe nhỏ giữa các tấm và khoan lỗ vít rộng hơn thân vít một chút để tấm giãn nở khi trời nắng.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7j",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7h",
            "text": "Thoát nước:",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k7i",
            "text": " không để nước đọng trên cạnh trên của biển; bo kín mép trên bằng nẹp hoặc silicone.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7l",
        "style": "h2",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7k",
            "text": "Vệ sinh và kiểm tra định kỳ",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "k7n",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7m",
            "text": "Lau bề mặt bằng khăn mềm và dung dịch tẩy rửa nhẹ; tránh chất tẩy mạnh làm mờ màu, ăn mòn bề mặt.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7p",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7o",
            "text": "Kiểm tra định kỳ vít, keo và khung sau mùa mưa bão để phát hiện sớm chỗ lỏng, bong.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7r",
        "style": "normal",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7q",
            "text": "Thay tấm khi bề mặt in đã phai nhiều — chi phí thấp hơn nhiều so với sửa chữa khung.",
            "marks": []
          }
        ],
        "listItem": "bullet",
        "level": 1
      },
      {
        "_type": "block",
        "_key": "k7v",
        "style": "blockquote",
        "markDefs": [],
        "children": [
          {
            "_type": "span",
            "_key": "k7s",
            "text": "Tư vấn cho công trình ngoài trời",
            "marks": [
              "strong"
            ]
          },
          {
            "_type": "span",
            "_key": "k7u",
            "text": "\n",
            "marks": []
          },
          {
            "_type": "span",
            "_key": "k7t",
            "text": "Gửi kích thước biển, vị trí lắp và thời gian sử dụng mong muốn — WIN tư vấn độ dày và cách lắp phù hợp.",
            "marks": []
          }
        ]
      }
    ]
  }
] satisfies {
  slug: string; title: string; excerpt: string; publishedAt: string; updatedAt?: string; image: ImageRef;
  categorySlug: string; seoDescription: string; body: RichText;
}[];

export const CRAWL_APPLICATIONS = [
  {
    "slug": "bang-quang-cao-in-uv",
    "summary": "Bề mặt trắng, phẳng, mịn cho màu in UV sắc nét. Tấm 3 ly nhẹ, rọc dao được — làm biển bảng, chân quảng cáo, bảng trưng bày trong nhà.",
    "cardImage": {
      "url": "/images/seed/4565786575.webp",
      "width": 1200,
      "height": 896,
      "alt": "Máy in UV phẳng in hoạ tiết hình học nhiều màu trực tiếp lên tấm Fomex"
    },
    "album": [
      {
        "url": "/images/seed/4565786575.webp",
        "width": 1200,
        "height": 896,
        "alt": "Máy in UV phẳng in hoạ tiết hình học nhiều màu trực tiếp lên tấm Fomex",
        "caption": "In UV phẳng trực tiếp lên tấm Fomex trắng"
      },
      {
        "url": "/images/seed/baa7d84646.webp",
        "width": 1200,
        "height": 896,
        "alt": "Tấm Fomex in UV hoạ tiết hình học đặt trên giá trưng bày",
        "caption": "Tấm in hoàn thiện, phẳng, không cong vênh"
      },
      {
        "url": "/images/seed/8817ef6625.webp",
        "width": 1200,
        "height": 896,
        "alt": "Cận cảnh góc cắt tấm Fomex in UV: lõi trắng đặc và lớp mực màu trên bề mặt",
        "caption": "Góc cắt vuông, lõi đặc; lớp mực bám trên bề mặt mịn"
      }
    ]
  },
  {
    "slug": "chu-noi-logo-khoi",
    "summary": "Độ dày tạo chiều sâu cho chữ: cắt chân chữ, chữ nổi, logo tạo khối bằng CNC; mép cắt gọn, chà nhám là mịn.",
    "cardImage": {
      "url": "/images/seed/f3e5a1ea1f.webp",
      "width": 1200,
      "height": 896,
      "alt": "Các khối hình tròn, vòm bậc, lục giác cắt từ tấm Fomex dày, mặt dán màu xanh"
    },
    "album": [
      {
        "url": "/images/seed/f3e5a1ea1f.webp",
        "width": 1200,
        "height": 896,
        "alt": "Các khối hình tròn, vòm bậc, lục giác cắt từ tấm Fomex dày, mặt dán màu xanh",
        "caption": "Khối hình cắt từ tấm dày, mặt dán màu, đứng vững không cần đế"
      },
      {
        "url": "/images/seed/34c681c8b9.webp",
        "width": 1200,
        "height": 896,
        "alt": "Máy CNC cắt các khối hình tròn, vòm, đa giác từ tấm Fomex trắng",
        "caption": "Cắt CNC theo đường viền trên tấm Fomex trắng"
      },
      {
        "url": "/images/seed/bcdabee4bb.webp",
        "width": 1200,
        "height": 896,
        "alt": "Cận cảnh cạnh cắt CNC của khối hình Fomex dày mặt dán màu xanh",
        "caption": "Cạnh cắt vuông, lõi đặc tạo chiều sâu cho khối"
      }
    ]
  },
  {
    "slug": "noi-that-vach-trang-tri",
    "summary": "Bắt vít, dán cạnh như ván gỗ công nghiệp; không trương nở do nước, không mối mọt — dùng cho tủ, kệ, vách và trần trang trí cắt CNC.",
    "cardImage": {
      "url": "/images/seed/370160bfef.webp",
      "width": 1200,
      "height": 670,
      "alt": "Vách trang trí và trần cắt CNC từ tấm Fomex trong không gian nội thất"
    },
    "album": [
      {
        "url": "/images/seed/370160bfef.webp",
        "width": 1200,
        "height": 670,
        "alt": "Vách trang trí và trần cắt CNC từ tấm Fomex trong không gian nội thất",
        "caption": "Vách và trần trang trí cắt CNC từ tấm Fomex"
      },
      {
        "url": "/images/seed/41370ee9d2.webp",
        "width": 1200,
        "height": 896,
        "alt": "Vách ngăn hoa văn hình học cắt CNC từ tấm Fomex trắng ở sảnh văn phòng",
        "caption": "Vách ngăn hoa văn hình học ở sảnh văn phòng"
      },
      {
        "url": "/images/seed/fac76d8483.webp",
        "width": 1200,
        "height": 896,
        "alt": "Cận cảnh vách hoa văn cắt CNC từ tấm Fomex và chân đỡ ở sảnh văn phòng",
        "caption": "Đường cắt CNC sắc gọn, liên kết chân đỡ kín đáo"
      },
      {
        "url": "/images/seed/b6272bba04.webp",
        "width": 1200,
        "height": 896,
        "alt": "Máy CNC phay hoa văn hình học trên tấm Fomex dày",
        "caption": "Phay hoa văn trên tấm Fomex dày bằng máy CNC"
      }
    ]
  },
  {
    "slug": "backdrop-sinh-nhat",
    "summary": "Nhẹ, dễ cắt theo hình, in UV hoặc dán decal trực tiếp. Tấm 3 ly cho mảng phụ, 5 ly cho mảng chính để giữ phẳng.",
    "album": [
      {
        "url": "/images/seed/c86f5b9c76.webp",
        "width": 1200,
        "height": 896,
        "alt": "Backdrop sinh nhật từ tấm Fomex cắt hình mây và vòm, bóng bay màu pastel",
        "caption": "Backdrop vòm và mây ghép từ tấm Fomex trắng"
      },
      {
        "url": "/images/seed/152d984958.webp",
        "width": 1200,
        "height": 896,
        "alt": "Thợ lắp khung đỡ phía sau tấm backdrop sinh nhật bằng Fomex",
        "caption": "Lắp khung đỡ phía sau tấm vòm tại địa điểm tiệc"
      },
      {
        "url": "/images/seed/5a6dbae961.webp",
        "width": 1200,
        "height": 896,
        "alt": "Cận cảnh mép cong cắt CNC của tấm vòm và mảng mây bằng Fomex trắng",
        "caption": "Mép cong cắt gọn, các lớp mây ghép chồng nổi khối"
      }
    ]
  },
  {
    "slug": "backdrop-su-kien",
    "summary": "Khung lớn nên dùng tấm dày hơn để giữ phẳng; bề mặt in UV, dán decal tốt, lắp ráp nhanh tại sự kiện.",
    "album": [
      {
        "url": "/images/seed/0a7df2b132.webp",
        "width": 1200,
        "height": 896,
        "alt": "Backdrop sân khấu hội trường ghép từ các tấm Fomex in hoạ tiết sóng xanh",
        "caption": "Backdrop sân khấu ghép từ nhiều tấm in"
      },
      {
        "url": "/images/seed/3c1e3156f4.webp",
        "width": 1200,
        "height": 896,
        "alt": "Thợ lắp các tấm Fomex in hoạ tiết sóng lên khung sân khấu hội trường",
        "caption": "Lắp các tấm in sẵn lên khung sân khấu"
      },
      {
        "url": "/images/seed/a84231e0c7.webp",
        "width": 1200,
        "height": 896,
        "alt": "Mối ghép thẳng giữa hai tấm Fomex in, hoạ tiết sóng liền mạch",
        "caption": "Mối ghép thẳng, hoạ tiết in liền mạch giữa hai tấm"
      }
    ]
  },
  {
    "slug": "cat-dan-decal",
    "summary": "Bề mặt mịn giúp decal bám chắc, ít bong mép khi cắt chữ; tấm 3 ly rọc dao được, tiết kiệm chi phí.",
    "album": [
      {
        "url": "/images/seed/f33e61ade6.webp",
        "width": 1200,
        "height": 896,
        "alt": "Dán decal hoạ tiết sóng lên bề mặt tấm Fomex bằng gạt nỉ",
        "caption": "Dán decal lên bề mặt tấm Fomex bằng gạt nỉ"
      },
      {
        "url": "/images/seed/4270578ac2.webp",
        "width": 1200,
        "height": 896,
        "alt": "Bóc lớp giấy lót decal màu dán trên tấm Fomex trắng ở bàn gia công",
        "caption": "Bóc lớp lót decal — bề mặt mịn giúp decal bám chắc"
      },
      {
        "url": "/images/seed/447303b872.webp",
        "width": 1200,
        "height": 896,
        "alt": "Tấm Fomex trắng dán decal hình sóng và hình tròn màu xanh, cam",
        "caption": "Tấm hoàn thiện với decal màu cắt theo hình"
      }
    ]
  },
  {
    "slug": "hashtag-check-in",
    "summary": "Đủ cứng khi cầm, mép cắt CNC gọn — làm hashtag, bảng check-in cầm tay cho sự kiện.",
    "album": [
      {
        "url": "/images/seed/a9297e1749.webp",
        "width": 1200,
        "height": 896,
        "alt": "Khách cầm hashtag check-in cắt từ tấm Fomex tại sự kiện",
        "caption": "Hashtag check-in cầm tay tại sự kiện"
      },
      {
        "url": "/images/seed/91c208f4e0.webp",
        "width": 1200,
        "height": 896,
        "alt": "Bộ hashtag, trái tim, ngôi sao cầm tay cắt từ tấm Fomex ở quầy check-in sự kiện",
        "caption": "Bộ đạo cụ check-in cắt hình, in hoạ tiết màu"
      },
      {
        "url": "/images/seed/e461dd00b8.webp",
        "width": 1200,
        "height": 896,
        "alt": "Cận cảnh hashtag cắt CNC từ tấm Fomex, mép cắt vuông gọn",
        "caption": "Mép cắt CNC vuông gọn, lõi đặc"
      }
    ]
  }
] satisfies { slug: string; summary?: string; cardImage?: ImageRef; album: CrawlImage[] }[];

export const CRAWL_PRODUCT_GROUPS = [
  {
    "slug": "fomex-3-ly",
    "badge": "Phổ biến",
    "image": {
      "url": "/images/seed/96452c7e62.webp",
      "width": 1200,
      "height": 896,
      "alt": "Tấm Fomex 3 ly uốn cong, thể hiện độ dẻo của tấm mỏng"
    },
    "specs": [
      {
        "label": "Fomex 3 ly thiếu",
        "grade": "thieu",
        "actualThicknessMm": 2.4,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "15 tấm/kẹp"
      },
      {
        "label": "Fomex 3 ly đủ",
        "grade": "du",
        "actualThicknessMm": 2.7,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "15 tấm/kẹp"
      }
    ]
  },
  {
    "slug": "fomex-5-ly",
    "badge": "Linh hoạt",
    "image": {
      "url": "/images/seed/c4395e09b4.webp",
      "width": 1200,
      "height": 896,
      "alt": "Chồng tấm Fomex mỏng trắng, mép cắt gọn"
    },
    "specs": [
      {
        "label": "Fomex 5 ly thiếu",
        "grade": "thieu",
        "actualThicknessMm": 3.8,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "12 tấm/kẹp"
      },
      {
        "label": "Fomex 5 ly thiếu",
        "grade": "thieu",
        "actualThicknessMm": 4,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "12 tấm/kẹp"
      },
      {
        "label": "Fomex 5 ly thiếu dày",
        "grade": "thieu",
        "actualThicknessMm": 4.2,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "10 tấm/kẹp"
      },
      {
        "label": "Fomex 5 ly đủ",
        "grade": "du",
        "actualThicknessMm": 4.7,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "10 tấm/kẹp"
      }
    ]
  },
  {
    "slug": "fomex-8-10-ly",
    "badge": "Chịu lực",
    "image": {
      "url": "/images/seed/249a4fbc72.webp",
      "width": 1200,
      "height": 896,
      "alt": "Chồng tấm Fomex độ dày trung bình"
    },
    "specs": [
      {
        "label": "Fomex 8 ly",
        "grade": "khac",
        "actualThicknessMm": 7,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "5 tấm/kẹp"
      },
      {
        "label": "Fomex 8 ly đủ",
        "grade": "du",
        "actualThicknessMm": 7.6,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "5 tấm/kẹp"
      },
      {
        "label": "Fomex 10 ly thiếu",
        "grade": "thieu",
        "actualThicknessMm": 8.5,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "5 tấm/kẹp"
      },
      {
        "label": "Fomex 10 ly đủ",
        "grade": "du",
        "actualThicknessMm": 9.5,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "5 tấm/kẹp"
      }
    ]
  },
  {
    "slug": "fomex-15-18-ly",
    "badge": "Dày lớn",
    "image": {
      "url": "/images/seed/5ac2ea3d92.webp",
      "width": 1200,
      "height": 896,
      "alt": "Khối tấm Fomex dày xếp chồng"
    },
    "specs": [
      {
        "label": "Fomex 15 ly",
        "grade": "khac",
        "actualThicknessMm": 13.5,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "3 tấm/kẹp"
      },
      {
        "label": "Fomex 15 ly",
        "grade": "khac",
        "actualThicknessMm": 14,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "3 tấm/kẹp"
      },
      {
        "label": "Fomex 18 ly",
        "grade": "khac",
        "actualThicknessMm": 16.5,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "2 tấm/kẹp"
      },
      {
        "label": "Fomex 18 ly",
        "grade": "khac",
        "actualThicknessMm": 17,
        "sizeMm": "1220 × 2440 mm",
        "sheetsPerBundle": "2 tấm/kẹp"
      }
    ]
  }
] satisfies { slug: string; badge?: string; image?: ImageRef; specs: SpecRow[] }[];

export const CRAWL_IMAGES = {
  "47d2391c86": {
    "url": "/images/seed/47d2391c86.webp",
    "width": 1200,
    "height": 670,
    "alt": "Dây chuyền đùn ép tấm Fomex trắng dưới biển WIN trong nhà máy"
  },
  "141c077228": {
    "url": "/images/seed/141c077228.webp",
    "width": 1200,
    "height": 670,
    "alt": "Dây chuyền sản xuất tấm Fomex trong nhà xưởng WIN"
  },
  "9ba63de8b8": {
    "url": "/images/seed/9ba63de8b8.webp",
    "width": 1200,
    "height": 670,
    "alt": "Đầu khuôn đùn tấm Fomex trên dây chuyền WIN"
  },
  "6161c1f91a": {
    "url": "/images/seed/6161c1f91a.webp",
    "width": 1200,
    "height": 896,
    "alt": "Đo độ dày tấm Fomex bằng thước kẹp điện tử trên dây chuyền"
  },
  "96452c7e62": {
    "url": "/images/seed/96452c7e62.webp",
    "width": 1200,
    "height": 896,
    "alt": "Tấm Fomex 3 ly uốn cong, thể hiện độ dẻo của tấm mỏng"
  },
  "c4395e09b4": {
    "url": "/images/seed/c4395e09b4.webp",
    "width": 1200,
    "height": 896,
    "alt": "Chồng tấm Fomex mỏng trắng, mép cắt gọn"
  },
  "249a4fbc72": {
    "url": "/images/seed/249a4fbc72.webp",
    "width": 1200,
    "height": 896,
    "alt": "Chồng tấm Fomex độ dày trung bình"
  },
  "5ac2ea3d92": {
    "url": "/images/seed/5ac2ea3d92.webp",
    "width": 1200,
    "height": 896,
    "alt": "Khối tấm Fomex dày xếp chồng"
  },
  "4565786575": {
    "url": "/images/seed/4565786575.webp",
    "width": 1200,
    "height": 896,
    "alt": "Máy in UV phẳng in hoạ tiết hình học nhiều màu trực tiếp lên tấm Fomex"
  },
  "f3e5a1ea1f": {
    "url": "/images/seed/f3e5a1ea1f.webp",
    "width": 1200,
    "height": 896,
    "alt": "Các khối hình tròn, vòm bậc, lục giác cắt từ tấm Fomex dày, mặt dán màu xanh"
  },
  "370160bfef": {
    "url": "/images/seed/370160bfef.webp",
    "width": 1200,
    "height": 670,
    "alt": "Vách trang trí và trần cắt CNC từ tấm Fomex trong không gian nội thất"
  },
  "a9e342c97c": {
    "url": "/images/seed/a9e342c97c.webp",
    "width": 1200,
    "height": 670,
    "alt": "Nhà máy Nhựa WIN Việt Nam: biển logo WIN, xe nâng và xe tải xếp kiện tấm Fomex"
  },
  "7c47e034d8": {
    "url": "/images/seed/7c47e034d8.webp",
    "width": 1200,
    "height": 670,
    "alt": "Đội ngũ WIN trao đổi kỹ thuật tại nhà máy"
  },
  "8c3b2e3a16": {
    "url": "/images/seed/8c3b2e3a16.webp",
    "width": 1200,
    "height": 896,
    "alt": "Mặt cắt các tấm Fomex nhiều độ dày xếp cạnh nhau"
  },
  "183f540afc": {
    "url": "/images/seed/183f540afc.webp",
    "width": 1200,
    "height": 670,
    "alt": "Đoàn xe tải chở tấm Fomex xuất xưởng"
  },
  "39ad65ea3f": {
    "url": "/images/seed/39ad65ea3f.webp",
    "width": 1200,
    "height": 670,
    "alt": "Chồng tấm Fomex trắng trên kệ gỗ dưới logo WIN trong phòng trưng bày"
  },
  "d9f007e896": {
    "url": "/images/seed/d9f007e896.webp",
    "width": 1200,
    "height": 670,
    "alt": "Hệ thống silo phối trộn nguyên liệu tại nhà máy WIN"
  },
  "712c57da05": {
    "url": "/images/seed/712c57da05.webp",
    "width": 1200,
    "height": 670,
    "alt": "Cụm lô cán định hình và làm nguội tấm Fomex"
  },
  "835e9446e4": {
    "url": "/images/seed/835e9446e4.webp",
    "width": 1200,
    "height": 670,
    "alt": "Máy cắt khổ tấm Fomex tự động"
  },
  "793b375590": {
    "url": "/images/seed/793b375590.webp",
    "width": 1200,
    "height": 670,
    "alt": "Khu xếp hàng với kiện tấm Fomex bọc màng và xe nâng"
  },
  "1f0240b13d": {
    "url": "/images/seed/1f0240b13d.webp",
    "width": 1200,
    "height": 670,
    "alt": "Kho thành phẩm tấm Fomex của Nhựa WIN Việt Nam"
  },
  "ec73a227fb": {
    "url": "/images/seed/ec73a227fb.webp",
    "width": 1200,
    "height": 670,
    "alt": "Màn hình điều khiển dây chuyền đùn ép tại nhà máy WIN"
  },
  "6d29e262bb": {
    "url": "/images/seed/6d29e262bb.webp",
    "width": 1200,
    "height": 670,
    "alt": "Cụm dán màng bảo vệ lên bề mặt tấm Fomex"
  },
  "58cb260fde": {
    "url": "/images/seed/58cb260fde.webp",
    "width": 1200,
    "height": 670,
    "alt": "Sân nhà máy WIN, kiện tấm Fomex chờ xuất hàng"
  },
  "58ff559f46": {
    "url": "/images/seed/58ff559f46.webp",
    "width": 1200,
    "height": 670,
    "alt": "Khu xuất hàng nhà máy WIN: xe nâng đưa kiện tấm Fomex lên xe tải dưới biển logo WIN"
  }
} satisfies Record<string, ImageRef>;
