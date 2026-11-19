import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./env";

describe("parseServerEnv — nguồn nội dung (KT-01, KT-11)", () => {
  it("SANITY_SOURCE=seed → seed dù có projectId", () => {
    const env = parseServerEnv({ SANITY_SOURCE: "seed", NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" });
    expect(env.contentSource).toBe("seed");
  });

  it("DATA_SOURCE=fixtures (tên trong build_plan) cũng là seed", () => {
    const env = parseServerEnv({ DATA_SOURCE: "fixtures", NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" });
    expect(env.contentSource).toBe("seed");
  });

  it("có projectId, không ép seed → sanity, dataset mặc định production", () => {
    const env = parseServerEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" });
    expect(env.contentSource).toBe("sanity");
    expect(env.sanity.dataset).toBe("production");
    expect(env.sanity.projectId).toBe("abc123");
  });

  it("chưa có projectId ngoài production → seed", () => {
    expect(parseServerEnv({ VERCEL_ENV: "preview" }).contentSource).toBe("seed");
    expect(parseServerEnv({}).contentSource).toBe("seed");
  });

  it("production thiếu projectId → lỗi, không lặng lẽ dùng seed", () => {
    expect(() => parseServerEnv({ VERCEL_ENV: "production" })).toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
  });

  it("production ép seed → lỗi (GL-02: seed không được che CMS chưa nối)", () => {
    expect(() =>
      parseServerEnv({ VERCEL_ENV: "production", SANITY_SOURCE: "seed", NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" }),
    ).toThrow(/seed/);
  });

  it("giá trị lạ → lỗi rõ tên biến", () => {
    expect(() => parseServerEnv({ SANITY_SOURCE: "db" })).toThrow(/SANITY_SOURCE/);
    expect(() => parseServerEnv({ LEAD_DESTINATION: "mailchimp" })).toThrow(/LEAD_DESTINATION/);
    expect(() => parseServerEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "Có Dấu" })).toThrow(
      /NEXT_PUBLIC_SANITY_PROJECT_ID/,
    );
  });

  it("biến rỗng coi như không đặt", () => {
    const env = parseServerEnv({ SANITY_API_READ_TOKEN: "", NEXT_PUBLIC_GTM_ID: "" });
    expect(env.sanity.readToken).toBeUndefined();
    expect(env.tracking.gtmId).toBeUndefined();
  });
});
