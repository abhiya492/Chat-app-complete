import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const NoChatSelected = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100 via-base-200/20 to-base-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-bounce-subtle"></div>
      </div>
      
      <div className="max-w-md text-center space-y-6 relative z-10">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative group">
            <div
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 flex items-center
             justify-center animate-bounce-subtle shadow-2xl group-hover:scale-110 transition-transform duration-300"
            >
              <MessageSquare className="w-14 h-14 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-30 blur-2xl animate-pulse"></div>
          </div>
        </div>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent animate-fade-in">{t('welcome')}</h2>
        <p className="text-base-content/60 text-lg leading-relaxed animate-slide-up">
          {t('typeMessage')}
        </p>
        <div className="pt-4 animate-scale-in">
          <div className="inline-flex items-center gap-2 text-sm text-base-content/60 glass-effect px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
            <span className="size-2.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
            <span className="font-medium">Ready to connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;