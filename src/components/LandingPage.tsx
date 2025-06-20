import { ArrowRight } from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#fefdfb] text-[#1f1f1f] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex justify-between items-center py-6 px-8 bg-[#fffaf0] shadow-sm">
      <a href="/">
      <img src="/1.png" alt="CollaboraX logo" style={{ height: "60px" }} className="w-auto" />
      </a>
        <div className="flex gap-4 text-sm">
          <button 
            onClick={onSignIn}
            className="text-[#333] hover:underline hover:opacity-80 transition-opacity duration-300"
          >
            Log in or
          </button>
          <button 
            onClick={onSignUp}
            className="bg-[#ffa731] text-[#2d2d2d] px-5 py-2 rounded-full hover:bg-[#ea580c] font-semibold transition-colors duration-300"
          >
            Create ur account
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col md:flex-row justify-between items-center px-10 py-32 bg-[#fffdf9] mt-[80px]">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-snug text-[#1f1f1f] transition-colors duration-300 hover:text-[#ffa731]">
            Innovation is<br /> born at the <br /> intersection <br /> of difference
          </h1>
        </div>
        <div className="md:w-1/2 max-w-md">
          <p className="text-[#1f1f1f] text-sm mb-10 text-justify">
          Colabora X drives change by connecting professionals across Europe to exchange jobs, share knowledge, and drive innovation through a temporary job exchange, leading to innovation through collaborative problem-solving. This diversity challenges assumptions, inspires creativity, and introduces new methods, creating more adaptive and forward-thinking workplaces that are better equipped to meet the challenges of the future workforce.          </p>
          <button 
            onClick={onSignUp}
            className="bg-[#ffa731] text-[#2d2d2d] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#ea580c] flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            Start ur journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

{/* orange box */}
      <section className="w-full px-6 py-20 flex justify-center">
  <div className="bg-[#ffa731] px-6 py-8 rounded-[50px] w-full max-w-4xl animate-fadeUp flex justify-center">
    <img
      src="/3.png"
      alt="Benefits Illustration"
      className="w-full max-w-3xl h-auto rounded-[30px]"
    />
  </div>
</section>



      {/* Mission Statement */}
      <section className="w-full px-6 pb-24">
        <div className="max-w-3xl mx-auto text-sm text-[#333] leading-relaxed animate-fadeIn text-justify">
          <p className="mb-4">
            Collabora X is designed to become the leading platform for international temporary job swaps within the European Union, breaking down geographical barriers to professional development and cultural exchange.
          </p>
          <p className="mb-4">
            By bringing together diverse perspectives and experiences, Colabora x sparks innovation and adaptability through meaningful collaboration.
          </p>
          <p className="mb-4">
            Employees temporarily swap roles across countries, bringing their knowledge into new contexts while gaining fresh skills, expanding their networks, travelling around, and enriching their careers, all while continuing to work.
          </p>
          <p>
            For companies, this dynamic exchange cultivates a more agile, globally connected, and forward-thinking workforce. Our goal is to empower people and organizations alike through a secure, efficient, and mutually beneficial system built for the future of work.
          </p>
        </div>
        <div className="w-full bg-[#ffa731] py-6 flex justify-center items-center my-20">
  <p className="text-2xl md:text-3xl font-extrabold text-[#1f1f1f] text-center max-w-4xl px-4">
    “Diversity is the engine of innovation.”
  </p>
</div>
        <hr className="border-t border-[#999] w-full max-w-md mx-auto" />
      </section>

      {/* How It Works */}
      <section className="w-full px-6 pb-24 text-center">
        <h2 className="text-3xl font-extrabold mb-12">how it works?</h2>
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto">
          <div className="bg-[#ffa731] text-[#2d2d2d] p-6 rounded-[50px] flex-1 text-justify">
            <h3 className="font-bold text-lg mb-2 text-center text-[#2d2d2d]">DISCOVER & PROPOSE</h3>
            <p className="text-sm">
              Employees and companies sign up! Employees browse exciting temporary job opportunities in desired international locations. Find a match and propose a swap with another employee. Companies approve employees.
            </p>
          </div>
          <div className="bg-[#ffa731] text-[#2d2d2d] p-6 rounded-[50px] flex-1 text-justify">
            <h3 className="font-bold text-lg mb-2 text-center text-[#2d2d2d]">MATCH & AGREE</h3>
            <p className="text-sm">
              If both employees agree to the mutual swap, their respective companies review the temporary exchange for final approval.
            </p>
          </div>
          <div className="bg-[#ffa731] text-[#2d2d2d] p-6 rounded-[50px] flex-1 text-justify">
            <h3 className="font-bold text-lg mb-2 text-center text-[#2d2d2d]">SWAP & EXPERIENCE</h3>
            <p className="text-sm">
              Once approved by both companies, employees connect directly to coordinate their international swap and begin their enriching global experience.
            </p>
          </div>
        </div>
      </section>

        {/* Legal Framework Section */}
        <section className="w-full px-6 py-16 bg-[#f8f8f8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1f1f1f] mb-4">Legally Protected & EU Compliant</h2>
            <p className="text-[#333] text-sm max-w-2xl mx-auto">
              All job exchanges operate within a comprehensive legal framework ensuring full protection for both companies and employees
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#ffa731] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📋</span>
                </div>
                <h3 className="font-bold text-[#1f1f1f]">Secure Contracts</h3>
              </div>
              <ul className="text-xs text-[#333] space-y-2">
                <li>• Temporary assignment agreements</li>
                <li>• Original employment protection</li>
                <li>• Clear terms & duration</li>
                <li>• Guaranteed return rights</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#ffa731] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🛡️</span>
                </div>
                <h3 className="font-bold text-[#1f1f1f]">Full Insurance</h3>
              </div>
              <ul className="text-xs text-[#333] space-y-2">
                <li>• EU health insurance coordination</li>
                <li>• Professional liability coverage</li>
                <li>• Travel & accommodation insurance</li>
                <li>• Emergency repatriation</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#ffa731] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🇪🇺</span>
                </div>
                <h3 className="font-bold text-[#1f1f1f]">EU Compliance</h3>
              </div>
              <ul className="text-xs text-[#333] space-y-2">
                <li>• Posted Workers Directive compliance</li>
                <li>• GDPR data protection</li>
                <li>• Social security coordination</li>
                <li>• Tax obligation guidance</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-xs text-[#333] bg-[#ffa731] bg-opacity-10 p-3 rounded-lg inline-block">
              <strong>Legal Support:</strong> Our legal team provides guidance throughout your exchange. 
              Contact <span className="font-semibold">.</span> for assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1f1f1f] text-white px-8 py-6">
  <div className="flex flex-col items-center justify-center text-center space-y-2">
  <img src="/2.png" alt="CollaboraX logob" style={{ height: "60px" }} className="w-auto" />
  <p className="text-sm">Empowering global professional exchange • Built for the future of work</p>
  </div>
</footer>


      {/* Animations */}
      <style>{`
        .animate-fadeUp {
          animation: fadeUp 1.3s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeIn {
          animation: fadeIn 1.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
