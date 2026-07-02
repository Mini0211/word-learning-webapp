// 서버 저장 페이로드 용량 한도를 넘지 않도록, 화면 표시에 쓰지 않는
// 긴 문자열 필드(lastAnswer, lastAiReason)는 동기화에서 제외한다.
export function compactWordStats(wordStats) {
  if (!wordStats || typeof wordStats !== 'object') return {};
  return Object.fromEntries(Object.entries(wordStats).map(([id, stats]) => {
    const { lastAnswer, lastAiReason, ...rest } = stats && typeof stats === 'object' ? stats : {};
    return [id, rest];
  }));
}

export function serverProgressForLanguage(progress, language) {
  return {
    language,
    mode: progress?.mode === 'exam' ? 'exam' : 'learn',
    studyFilter: progress?.studyFilter ?? 'all',
    deck: Array.isArray(progress?.deck) ? progress.deck : [],
    deckCursor: Number.isInteger(progress?.deckCursor) ? progress.deckCursor : 0,
    results: progress?.results && typeof progress.results === 'object' ? progress.results : {},
    wordStats: compactWordStats(progress?.wordStats),
    correct: Number.isInteger(progress?.correct) ? progress.correct : 0,
    wrong: Number.isInteger(progress?.wrong) ? progress.wrong : 0,
    examCorrect: Number.isInteger(progress?.examCorrect) ? progress.examCorrect : 0,
    examWrong: Number.isInteger(progress?.examWrong) ? progress.examWrong : 0,
    examLimit: [25, 50, 100].includes(Number(progress?.examLimit)) ? Number(progress.examLimit) : 25,
    updatedAt: progress?.updatedAt || null,
  };
}

export function isServerProgressNewer(localProgress, serverProgress) {
  const serverTime = Date.parse(serverProgress?.updatedAt || '');
  const localTime = Date.parse(localProgress?.updatedAt || '');
  if (!Number.isFinite(serverTime)) return false;
  if (!Number.isFinite(localTime)) return true;
  return serverTime > localTime;
}

export function mergeProgressByUpdatedAt(localProgress, serverProgress) {
  if (!isServerProgressNewer(localProgress, serverProgress)) return localProgress;
  return {
    ...localProgress,
    ...serverProgress,
    results: serverProgress?.results ?? localProgress?.results ?? {},
    wordStats: serverProgress?.wordStats ?? localProgress?.wordStats ?? {},
    deck: Array.isArray(serverProgress?.deck) ? serverProgress.deck : localProgress?.deck ?? [],
  };
}
