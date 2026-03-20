import { useEffect } from 'react';
import { useModule } from '../hooks/useModule';
import { getIconComponent, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from '../components/ui/Icons';
import CountUp from '../components/ui/CountUp';
import ContentBlocks from '../components/content/ContentBlocks';
import CollapsibleSection from '../components/content/CollapsibleSection';
import MarketShareChart from '../components/content/MarketShareChart';
import ProvisionCalc from '../components/content/ProvisionCalc';

function getFirstBlockTitle(blocks, fallback) {
  for (const b of blocks) {
    if (b.title && !['chartLine', 'chartBar', 'chartDonut'].includes(b.type)) return b.title;
  }
  return fallback;
}

export default function ChapterView() {
  const { data, chapter, chapterIndex, subChapterId, setSubChapterId, openChapter, openSubChapter } = useModule();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter?.id, subChapterId]);

  // Auto-select first sub-chapter
  useEffect(() => {
    if (chapter?.subChapters?.length > 0 && !subChapterId) {
      setSubChapterId(chapter.subChapters[0].id);
    }
  }, [chapter, subChapterId, setSubChapterId]);

  if (!chapter) return null;

  const total = data?.chapters?.length || 0;
  const num = String(chapterIndex + 1).padStart(2, '0');
  const stat = chapter.heroStat;
  const activeSub = chapter.subChapters?.find(s => s.id === subChapterId);
  const quickStats = activeSub?.quickStats || chapter.quickStats;

  const prevChapter = chapterIndex > 0 ? data.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < total - 1 ? data.chapters[chapterIndex + 1] : null;

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <div className="header-gradient px-6 py-10 text-white">
        <div className="">
          <span className="text-xs font-mono text-white/50 mb-2 block">
            {num} / {String(total).padStart(2, '0')}
          </span>

          {/* Hero Stat */}
          {stat && (
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold font-mono">
                  <CountUp target={stat.value} />
                </span>
                <span className="text-2xl font-light opacity-80">{stat.unit}</span>
              </div>
              {stat.trend && (
                <span className={`inline-flex items-center gap-1 text-sm mt-1 ${stat.trend.direction === 'up' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {stat.trend.direction === 'up' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  {stat.trend.value}
                </span>
              )}
              <p className="text-sm text-white/60 mt-1">{stat.label}</p>
            </div>
          )}

          {/* Quick Stats */}
          {quickStats?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickStats.map((qs, i) => (
                <div key={i} className="bg-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono">
                      <CountUp target={qs.value} decimals={qs.value % 1 !== 0 ? 1 : 0} />
                    </span>
                    {qs.unit && <span className="text-sm opacity-70">{qs.unit}</span>}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">{qs.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 ">
        {/* Sub-chapter tabs */}
        {chapter.subChapters?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none' }}>
            {chapter.subChapters.map(sub => {
              const Icon = sub.icon ? getIconComponent(sub.icon) : null;
              return (
                <button
                  key={sub.id}
                  className={`subtab ${subChapterId === sub.id ? 'active' : ''}`}
                  onClick={() => openSubChapter(chapter.id, sub.id)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{sub.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-chapter content */}
        {activeSub ? (
          <div key={activeSub.id}>
            {activeSub.subtitle && (
              <p className="text-sm text-slate-500 mb-4">{activeSub.subtitle}</p>
            )}
            {activeSub.level1?.length > 0 && (
              <ContentBlocks blocks={activeSub.level1} chapter={chapter} />
            )}
            {activeSub.level2?.length > 0 && (
              <CollapsibleSection title={activeSub.sectionTitle2 || getFirstBlockTitle(activeSub.level2, 'Vertiefung')}>
                <ContentBlocks blocks={activeSub.level2} chapter={chapter} />
              </CollapsibleSection>
            )}
            {activeSub.level3?.length > 0 && (
              <CollapsibleSection title={activeSub.sectionTitle3 || getFirstBlockTitle(activeSub.level3, 'Hintergrund & Details')}>
                <ContentBlocks blocks={activeSub.level3} chapter={chapter} />
              </CollapsibleSection>
            )}
          </div>
        ) : (
          <>
            {/* Flat chapter content */}
            {chapter.levels?.level1?.length > 0 && (
              <ContentBlocks blocks={chapter.levels.level1} chapter={chapter} />
            )}

            {/* Special chapter components */}
            {chapter.id === '05-verguetung-provision' && <ProvisionCalc />}
            {chapter.id === '02-marktteilnehmer' && <MarketShareChart />}

            {chapter.levels?.level2?.length > 0 && (
              <CollapsibleSection title={getFirstBlockTitle(chapter.levels.level2, 'Vertiefung')}>
                <ContentBlocks blocks={chapter.levels.level2} chapter={chapter} />
              </CollapsibleSection>
            )}
            {chapter.levels?.level3?.length > 0 && (
              <CollapsibleSection title={getFirstBlockTitle(chapter.levels.level3, 'Hintergrund & Details')}>
                <ContentBlocks blocks={chapter.levels.level3} chapter={chapter} />
              </CollapsibleSection>
            )}
          </>
        )}

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200">
          {prevChapter ? (
            <button
              onClick={() => openChapter(prevChapter.id)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{prevChapter.title}</span>
            </button>
          ) : <div />}
          {nextChapter ? (
            <button
              onClick={() => openChapter(nextChapter.id)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 transition"
            >
              <span>{nextChapter.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
