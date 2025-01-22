"use client";

export default function Progression({ step }: { step: number }) {
  const stepMessage = () => {
    switch (step) {
      case 1:
        return "Claiming Aero rewards";
      case 2:
        return "Approving Aero";
      case 3:
        return "Zapping in Aero in LUCHA/WETH LP and staking";
      case 4:
        return "Done!";
      default:
        return "";
    }
  };

  return (
    <>
      {step > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "300px",
              backgroundColor: "#e0e0df",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(step / 4) * 100}%`,
                height: "10px",
                backgroundColor: "#76c7c0",
                transition: "width 0.3s ease-in-out",
              }}
            ></div>
          </div>
          <p style={{ marginTop: "10px" }}>{stepMessage()}</p>
        </div>
      )}
    </>
  );
}
