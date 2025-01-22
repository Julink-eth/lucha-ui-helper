import Connect from "@/components/Connect";
import styles from "./page.module.css";
import ClaimAndZapIn from "@/components/ClaimAndZapIn";
import ZapInLP from "@/components/ZapInLP";
import UserPositions from "@/components/UserPositions";

export default function Home() {
  return (
    <main className={styles["main"]}>
      <Connect />
      <div className="divider"></div>
      <UserPositions />
      <div className="divider"></div>
      <ZapInLP />
      <div className="divider"></div>
      <ClaimAndZapIn />
    </main>
  );
}
