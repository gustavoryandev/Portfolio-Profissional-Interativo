const StatsCard = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];
  return (
    <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-xl w-full max-w-sm mt-2 border border-slate-700 hover:border-blue-500 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-blue-400" size={24} />
        <h3 className="font-bold">{t.wakatime_title}</h3>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>JavaScript / TypeScript</span>
            <span className="font-mono text-blue-300">32h 15m</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{width: '75%'}}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>React / HTML / CSS</span>
            <span className="font-mono text-purple-300">18h 40m</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full" style={{width: '45%'}}></div></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
