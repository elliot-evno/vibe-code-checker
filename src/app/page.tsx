import { Repos } from "../components/repos";

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ 
           backgroundImage: "url('/images/computer-ghibli.png')",
           backgroundColor: '#EEEFE9' 
         }}>
      <Repos />
    </div>
  );
}
