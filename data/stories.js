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
    id: 'luz-do-sertao',
    titulo: 'A Luz do Sertão',
    autor: 'Ana Bezerra',
    nivel: 'Iniciante',
    duracao: '5 min',
    descricao: 'Uma menina descobre como as lamparinas unem uma vila em noite de festa.',
    cover: '/capas/luz-do-sertao.jpg',
    audio: '/audio/luz-do-sertao.mp3',
    paragrafos: [
      'No fim da tarde, Maria riscou o pé da chinela no chão de barro e sentiu o vento quente passar pela rua. Era dia de novena, e a vila inteira se preparava para acender lamparinas na praça.',
      'Ela correu com a avó até a janela da venda. Enquanto arrumavam os copos de cajuína, ouviam o zabumbaio distante do trio que vinha da feira. Cada som parecia chamar mais gente para perto.',
      'Quando a noite chegou, Maria percebeu que nenhuma lamparina brilhava sozinha. Uma acendia a outra, de mão em mão. Foi ali que entendeu: a luz do sertão fica mais forte quando todo mundo cuida dela junto.',
    ],
  },
  {
    id: 'o-cordel-da-chuva',
    titulo: 'O Cordel da Chuva',
    autor: 'Seu Antero Lima',
    nivel: 'Intermediário',
    duracao: '6 min',
    descricao: 'Um poeta de feira recita versos que anunciam a primeira chuva do ano.',
    cover: '/capas/o-cordel-da-chuva.jpg',
    audio: '/audio/o-cordel-da-chuva.mp3',
    paragrafos: [
      'Seu Antero abriu a mala de madeira logo cedo. Dentro, havia folhetos de cordel com capas coloridas e barbante novo para pendurar tudo na barraca.',
      'No meio da manhã, ele subiu num caixote e começou a declamar. Falou de nuvem grossa, cheiro de terra molhada e do povo sorrindo com o primeiro pingo na janela.',
      'Antes do último verso, o céu escureceu de verdade. A chuva caiu mansa, como se acompanhasse a rima. A feira inteira bateu palma, e o cordel virou memória de um dia esperado por meses.',
    ],
  },
  {
    id: 'sanfona-na-varanda',
    titulo: 'Sanfona na Varanda',
    autor: 'Rita e Joana',
    nivel: 'Iniciante',
    duracao: '4 min',
    descricao: 'Duas amigas aprendem a tocar um baião simples com o avô da rua.',
    cover: '/capas/sanfona-na-varanda.jpg',
    audio: '/audio/sanfona-na-varanda.mp3',
    paragrafos: [
      'Rita e Joana sentaram na varanda de madeira com os pés balançando no ar. O avô Chico apoiou a sanfona no colo e pediu silêncio para ouvir o compasso da rua.',
      'Primeiro veio um toque curto, depois outro mais comprido. As meninas repetiram na palma da mão, rindo quando erravam. O avô dizia que música boa é feita de paciência e escuta.',
      'Ao anoitecer, o baião saiu inteiro. Os vizinhos encostaram no portão para acompanhar, e a varanda virou palco. Rita percebeu que aprender também pode ser festa.',
    ],
  },
  {
    id: 'barco-de-jangada',
    titulo: 'Barco de Jangada',
    autor: 'Pedro do Mar',
    nivel: 'Avançado',
    duracao: '7 min',
    descricao: 'Um jovem jangadeiro aprende com a mãe a ler os sinais do mar.',
    cover: '/capas/barco-de-jangada.jpg',
    audio: '/audio/barco-de-jangada.mp3',
    paragrafos: [
      'Pedro acordou antes do sol e caminhou até a praia com a mãe, carregando rede e coragem. O mar estava liso, mas ela apontou o horizonte e falou das mudanças escondidas no vento.',
      'Enquanto ajeitavam a jangada, ela ensinou a observar gaivotas, correnteza e o brilho da água. Cada detalhe era uma palavra de um idioma antigo, passado de família em família.',
      'Na volta, com peixe fresco no balaio, Pedro entendeu que ler o mar parecia ler um livro vivo: toda página mudava rápido, mas quem presta atenção encontra caminho seguro para voltar.',
    ],
  },
].map(withTimedData);

export function getStoryById(id) {
  return stories.find((story) => story.id === id);
}
