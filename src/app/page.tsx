import { Repos } from "../components/repos";
import Pattern from "../components/Pattern";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Pattern />
      <Repos />
    </div>
  );
}
