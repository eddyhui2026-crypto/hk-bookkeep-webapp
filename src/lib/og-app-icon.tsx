/** 供 icon.tsx / apple-icon.tsx 用 ImageResponse 輸出高解像 PNG（手機「加到主畫面」唔食 SVG） */
export function AppIconOg({ side }: { side: number }) {
  const u = (n: number) => Math.round((n * side) / 512);

  const round = (px: number) => (side >= 256 ? px : Math.max(px, 1));

  return (
    <div
      style={{
        width: side,
        height: side,
        position: "relative",
        display: "flex",
        backgroundColor: "#ffffff",
        borderRadius: u(112),
        overflow: "hidden",
      }}
    >
      {/* 周邊光斑（實色疊加，避免 OG 對 radial-gradient 支援不一） */}
      <div
        style={{
          position: "absolute",
          left: u(66),
          top: u(66),
          width: u(104),
          height: u(104),
          borderRadius: u(104),
          background: "rgba(167, 139, 250, 0.42)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(358),
          top: u(52),
          width: u(88),
          height: u(88),
          borderRadius: u(88),
          background: "rgba(251, 191, 36, 0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(48),
          top: u(344),
          width: u(96),
          height: u(96),
          borderRadius: u(96),
          background: "rgba(52, 211, 153, 0.38)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(364),
          top: u(324),
          width: u(112),
          height: u(112),
          borderRadius: u(112),
          background: "rgba(244, 114, 182, 0.32)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(8),
          top: u(176),
          width: u(60),
          height: u(144),
          borderRadius: u(30),
          background: "linear-gradient(180deg, rgba(251, 191, 36, 0.5), rgba(239, 68, 68, 0.35))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(414),
          top: u(168),
          width: u(68),
          height: u(152),
          borderRadius: u(34),
          background: "linear-gradient(180deg, rgba(34, 211, 238, 0.45), rgba(74, 222, 128, 0.35))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(168),
          top: u(44),
          width: u(176),
          height: u(56),
          borderRadius: u(28),
          background:
            "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #14b8a6, #84cc16, #eab308, #f97316)",
          opacity: 0.38,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: u(150),
          top: u(182),
          width: u(36),
          height: u(36),
          borderRadius: u(36),
          background: "rgba(239, 68, 68, 0.72)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(338),
          top: u(154),
          width: u(28),
          height: u(28),
          borderRadius: u(28),
          background: "rgba(59, 130, 246, 0.78)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(376),
          top: u(236),
          width: u(24),
          height: u(24),
          borderRadius: u(24),
          background: "rgba(234, 179, 8, 0.85)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(114),
          top: u(272),
          width: u(32),
          height: u(32),
          borderRadius: u(32),
          background: "rgba(168, 85, 247, 0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(190),
          top: u(116),
          width: u(20),
          height: u(20),
          borderRadius: u(20),
          background: "rgba(6, 182, 212, 0.88)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(300),
          top: u(320),
          width: u(40),
          height: u(40),
          borderRadius: u(40),
          background: "rgba(244, 63, 94, 0.58)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(233),
          top: u(405),
          width: u(30),
          height: u(30),
          borderRadius: u(30),
          background: "rgba(34, 197, 94, 0.72)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(411),
          top: u(159),
          width: u(18),
          height: u(18),
          borderRadius: u(18),
          background: "rgba(253, 224, 71, 0.92)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(77),
          top: u(157),
          width: u(22),
          height: u(22),
          borderRadius: u(22),
          background: "rgba(251, 146, 60, 0.8)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: u(368),
          top: u(308),
          width: u(40),
          height: u(34),
          background: "rgba(139, 92, 246, 0.52)",
          transform: "rotate(-12deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(98),
          top: u(328),
          width: u(44),
          height: u(32),
          background: "rgba(20, 184, 166, 0.48)",
          transform: "rotate(18deg)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: u(227),
          top: u(147),
          width: round(10),
          height: round(10),
          borderRadius: round(10),
          background: "rgba(255,255,255,0.95)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(304),
          top: u(120),
          width: round(8),
          height: round(8),
          borderRadius: round(8),
          background: "rgba(255,255,255,0.92)",
        }}
      />

      {/* 最後畫、避免 ImageResponse 唔支援 z-index */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: u(268),
            fontWeight: 900,
            color: "#0f172a",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            letterSpacing: u(-8),
            lineHeight: 1,
          }}
        >
          B
        </span>
      </div>
    </div>
  );
}
