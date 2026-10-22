import { Github } from 'lucide-react';

const GithubCard = () => {
  return (
    <div className="bg-neutral-900 dark:bg-neutral-950 text-white p-5 rounded-2xl shadow-xl w-full max-w-sm mt-2 border border-neutral-700">
      <div className="flex items-center gap-3 mb-4">
        <Github className="text-white" size={24} />
        <h3 className="font-bold">GitHub Stats (gustavoryan)</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-800 p-3 rounded-lg text-center border border-neutral-700">
          <p className="text-2xl font-bold font-mono">48</p>
          <p className="text-xs text-neutral-400 uppercase tracking-wide">Repositórios</p>
        </div>
        <div className="bg-neutral-800 p-3 rounded-lg text-center border border-neutral-700">
          <p className="text-2xl font-bold font-mono">312</p>
          <p className="text-xs text-neutral-400 uppercase tracking-wide">Commits (Mês)</p>
        </div>
      </div>
    </div>
  );
};

export default GithubCard;