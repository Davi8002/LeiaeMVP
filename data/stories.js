import alienistaParagraphs from './alienistaParagraphs.json';

function splitIntoSentences(text) {
  const matches = text.match(/[^.!?]+[.!?]?/g);
  if (!matches) return [text.trim()];
  return matches.map((item) => item.trim()).filter(Boolean);
}

function splitIntoWords(text) {
  const matches = text.match(/\S+/g);
  if (!matches) return [];
  return matches;
}

function buildTimedPhrases(paragrafos) {
  let cursor = 0;
  let globalIndex = 0;

  return paragrafos.flatMap((paragrafo, paragrafoIndex) => {
    const frases = splitIntoSentences(paragrafo);

    return frases.map((texto, ordemNoParagrafo) => {
      const words = splitIntoWords(texto).length;
      const duration = Math.max(2.2, Math.min(6.5, Number((words / 2.6).toFixed(2))));
      const inicio = Number(cursor.toFixed(2));
      const fim = Number((cursor + duration).toFixed(2));

      const phrase = {
        indice: globalIndex,
        paragrafoIndex,
        ordemNoParagrafo,
        texto,
        inicio,
        fim,
      };

      cursor = fim;
      globalIndex += 1;
      return phrase;
    });
  });
}

function buildTimedWords(frases) {
  let globalWordIndex = 0;
  let fullText = '';

  const palavras = frases.flatMap((frase) => {
    const words = splitIntoWords(frase.texto);
    const phraseDuration = Math.max(frase.fim - frase.inicio, 0.6);
    const wordDuration = phraseDuration / Math.max(words.length, 1);

    return words.map((palavra, ordemNaFrase) => {
      const inicio = Number((frase.inicio + ordemNaFrase * wordDuration).toFixed(2));
      const fim = Number((frase.inicio + (ordemNaFrase + 1) * wordDuration).toFixed(2));

      if (fullText.length > 0) {
        fullText += ' ';
      }

      const charInicio = fullText.length;
      fullText += palavra;
      const charFim = fullText.length;

      const palavraEntry = {
        indice: globalWordIndex,
        fraseIndex: frase.indice,
        paragrafoIndex: frase.paragrafoIndex,
        ordemNaFrase,
        texto: palavra,
        inicio,
        fim,
        charInicio,
        charFim,
      };

      globalWordIndex += 1;
      return palavraEntry;
    });
  });

  return {
    palavras,
    textoNarracao: fullText,
  };
}

function withTimedData(story) {
  const frases = buildTimedPhrases(story.paragrafos);
  const { palavras, textoNarracao } = buildTimedWords(frases);

  return {
    ...story,
    frases,
    palavras,
    textoNarracao,
  };
}

export const stories = [
  {
    id: 'o-alienista',
    titulo: 'O Alienista',
    autor: 'Machado de Assis',
    nivel: 'Avançada',
    duracao: '35 min',
    descricao: 'Simão Bacamarte funda a Casa Verde em Itaguaí e transforma a cidade em laboratório sobre razão e loucura.',
    cover: '/capas/alienista-capa.jpg',
    paragrafos: alienistaParagraphs,
  },
].map(withTimedData);

export function getStoryById(id) {
  return stories.find((story) => story.id === id);
}
