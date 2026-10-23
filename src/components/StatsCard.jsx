import React, { useContext } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export default function StatsCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  // Lê os dados ao vivo do WakaTime repassados pelo backend
  const wakatime = context?.wakatime;
  const days = wakatime?.days || [];
  
  // Como o WakaTime retorna os últimos 7 dias, o último é "Hoje" e o penúltimo é "Ontem"
  const today = days.length > 0 ? days[days.length - 1] : null;
  const yesterday = days.length > 1 ? days[days.length - 2] : null;

  // Calcula a barrinha percentual assumindo uma meta de 8h diárias (28800 segundos)
  const calcPercent = (seconds) => Math.min(((seconds || 0) / 28800) * 100, 100);

  return (
    <div className={`my-2 w-full max-w-sm rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg p-2 bg-zinc-950 text-amber-500 shadow-sm border border-zinc-800">
          <Clock className="h-5 w-5" />
        </div>
        <h3 className={`text-[17px] font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {t('cards.wakatime.titulo', 'Tempo de Código')}
        </h3>
      </div>
      
      {wakatime?.status === 'ok' && days.length > 0 ? (
        <div className="space-y-4">
          {/* Métrica de Hoje */}
          <div>
            <div className="mb-1.5 flex justify-between text-[13px] font-bold">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Hoje</span>
              <span className="text-amber-500">{today?.readable || '0h 0m'}</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <div 
                className="h-full rounded-full bg-amber-500 transition-all duration-1000" 
                style={{ width: `${calcPercent(today?.totalSeconds)}%` }} 
              />
            </div>
          </div>
          
          {/* Métrica de Ontem */}
          <div>
            <div className="mb-1.5 flex justify-between text-[13px] font-bold">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Ontem</span>
              <span className="text-amber-500/70">{yesterday?.readable || '0h 0m'}</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <div 
                className="h-full rounded-full bg-amber-500/50 transition-all duration-1000" 
                style={{ width: `${calcPercent(yesterday?.totalSeconds)}%` }} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={`py-4 text-center text-sm rounded-lg border border-dashed ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-200'}`}>
          As métricas de código não estão disponíveis no momento.
        </div>
      )}
      
      <div className={`mt-5 flex items-center gap-2 border-t pt-4 text-[13px] font-medium ${darkMode ? 'border-[#2a2a2a] text-zinc-500' : 'border-gray-200 text-gray-500'}`}>
        <TrendingUp size={16} className="text-amber-500" /> Sincronizado ao vivo via WakaTime
      </div>
    </div>
  );
}