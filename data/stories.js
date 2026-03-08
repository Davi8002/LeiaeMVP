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
    duracao: '10 min',
    descricao: 'Uma menina descobre como as lamparinas unem uma vila em noite de festa.',
    cover: '/capas/luz-do-sertao.jpg',
    audio: '/audio/luz-do-sertao.mp3',
    paragrafos: [
      'No fim da tarde, Maria riscou o pé da chinela no chão de barro e sentiu o vento quente passar pela rua. Era dia de novena, e a vila inteira se preparava para acender lamparinas na praça.',
      'Ela correu com a avó até a janela da venda. Enquanto arrumavam os copos de cajuína, ouviam o zabumbaio distante do trio que vinha da feira. Cada som parecia chamar mais gente para perto.',
      'Depois de ajudar no balcão, Maria atravessou a rua para levar um recado ao seu Damião, que pendurava bandeirolas entre os postes. Ele disse que a luz boa começa cedo, quando cada pessoa cuida da própria tarefa com paciência.',
      'Na casa da comadre Lurdes, o fogão de lenha estalava baixo e o cheiro de bolo de milho tomava o quintal. As crianças repetiam as cantigas da missa, e Maria percebia que a noite daquele dia já nascia cheia de esperança.',
      'Quando o sino tocou, a praça ficou coberta de gente. Alguns traziam bancos, outros carregavam velas, e tinha quem só chegasse para ouvir história. Um violeiro se sentou perto do coreto e puxou um baião manso, como quem acalma o coração.',
      'Na hora de acender as lamparinas, uma chama passou de mão em mão. Maria viu que nenhuma luz brilhava sozinha, porque uma sempre ajudava a outra a continuar acesa. O clarão pequeno de cada vidro virou um caminho inteiro sobre a rua.',
      'Já tarde da noite, voltando para casa, ela perguntou à avó por que aquilo emocionava tanto. A avó sorriu e respondeu que o sertão ensina devagar: quando o povo se junta, a escuridão perde força. Maria guardou essa frase como quem guarda um segredo.',
    ],
  },
  {
    id: 'o-cordel-da-chuva',
    titulo: 'O Cordel da Chuva',
    autor: 'Seu Antero Lima',
    nivel: 'Intermediário',
    duracao: '11 min',
    descricao: 'Um poeta de feira recita versos que anunciam a primeira chuva do ano.',
    cover: '/capas/o-cordel-da-chuva.jpg',
    audio: '/audio/o-cordel-da-chuva.mp3',
    paragrafos: [
      'Seu Antero abriu a mala de madeira logo cedo. Dentro, havia folhetos de cordel com capas coloridas e barbante novo para pendurar tudo na barraca.',
      'Antes de organizar os títulos, ele passou a mão nos papéis para tirar o pó da viagem. Cada folheto carregava uma memória: promessa de chuva, romance de estrada, peleja de cantador e notícia de colheita.',
      'No meio da manhã, ele subiu num caixote e começou a declamar. Falou de nuvem grossa, cheiro de terra molhada e do povo sorrindo com o primeiro pingo na janela.',
      'A feira parou por alguns minutos. A costureira encostou o cesto no chão, o rapaz do caldo de cana desligou a moenda e até os meninos que corriam atrás de pipa ficaram quietos para ouvir os versos que pareciam desenho do céu.',
      'Seu Antero improvisou uma estrofe para dona Celina, que guardava sementes em latas de manteiga esperando o inverno. Ela riu com os olhos marejados e disse que poesia também era um jeito de regar a esperança do povo.',
      'Antes do último verso, o céu escureceu de verdade. A chuva caiu mansa, como se acompanhasse a rima. A feira inteira bateu palma, e o cordel virou memória de um dia esperado por meses.',
      'Quando a água diminuiu, seu Antero recolheu os papéis para não molhar. Ainda assim deixou um folheto preso no barbante, balançando no vento. Era para lembrar que palavra boa, quando encontra seu tempo, vira abrigo para muita gente.',
    ],
  },
  {
    id: 'sanfona-na-varanda',
    titulo: 'Sanfona na Varanda',
    autor: 'Rita e Joana',
    nivel: 'Iniciante',
    duracao: '9 min',
    descricao: 'Duas amigas aprendem a tocar um baião simples com o avô da rua.',
    cover: '/capas/sanfona-na-varanda.jpg',
    audio: '/audio/sanfona-na-varanda.mp3',
    paragrafos: [
      'Rita e Joana sentaram na varanda de madeira com os pés balançando no ar. O avô Chico apoiou a sanfona no colo e pediu silêncio para ouvir o compasso da rua.',
      'Primeiro veio um toque curto, depois outro mais comprido. As meninas repetiram na palma da mão, rindo quando erravam. O avô dizia que música boa é feita de paciência e escuta.',
      'Na segunda tentativa, Rita acertou o ritmo e Joana entrou cantando baixinho. O avô bateu o pé no assoalho para marcar a pulsação, e os três ficaram alguns minutos só nesse exercício, como quem prepara terreno para plantar.',
      'Do outro lado da rua, dona Irene abriu a janela para acompanhar. Ela trouxe um pandeiro antigo e pediu licença para ajudar no ensaio. Cada batida do instrumento parecia costurar os sons da sanfona com as vozes das meninas.',
      'Quando o sol começou a cair, o avô contou que havia aprendido aquele baião com o pai dele, ainda menino. Disse também que melodia atravessa tempo quando alguém decide continuar tocando, mesmo sem pressa de acertar tudo de primeira.',
      'Ao anoitecer, o baião saiu inteiro. Os vizinhos encostaram no portão para acompanhar, e a varanda virou palco. Rita percebeu que aprender também pode ser festa.',
      'Antes de guardar a sanfona, Joana pediu para repetir a última parte. Tocaram de novo, mais confiantes, e a rua inteira cantou junto o refrão simples. Naquele momento, a varanda parecia maior do que qualquer palco da cidade.',
    ],
  },
  {
    id: 'barco-de-jangada',
    titulo: 'Barco de Jangada',
    autor: 'Pedro do Mar',
    nivel: 'Avançado',
    duracao: '12 min',
    descricao: 'Um jovem jangadeiro aprende com a mãe a ler os sinais do mar.',
    cover: '/capas/barco-de-jangada.jpg',
    audio: '/audio/barco-de-jangada.mp3',
    paragrafos: [
      'Pedro acordou antes do sol e caminhou até a praia com a mãe, carregando rede e coragem. O mar estava liso, mas ela apontou o horizonte e falou das mudanças escondidas no vento.',
      'Enquanto ajeitavam a jangada, ela ensinou a observar gaivotas, correnteza e o brilho da água. Cada detalhe era uma palavra de um idioma antigo, passado de família em família.',
      'Mais adiante, já com o barco em movimento, a mãe pediu que Pedro escutasse o estalo da madeira e o peso da rede molhada. Disse que o mar conversa por sinais pequenos, e quem aprende a notar esses sinais volta para casa com segurança.',
      'No meio da manhã, uma nuvem comprida apareceu por trás das dunas. Pedro quis continuar avançando, mas a mãe mandou reduzir o ritmo e mudar levemente a direção. Era cedo demais para arriscar quando o vento começava a virar.',
      'Eles lançaram a rede perto de um recife raso e esperaram em silêncio. O barulho das ondas batendo no casco marcava o tempo. Pedro percebeu que pescaria não era só força: era também calma para decidir no momento certo.',
      'Na volta, com peixe fresco no balaio, Pedro entendeu que ler o mar parecia ler um livro vivo: toda página mudava rápido, mas quem presta atenção encontra caminho seguro para voltar.',
      'Ao encostar a jangada na areia, ele viu outras embarcações chegando e repetindo o mesmo cuidado. Guardou a rede, respirou fundo e agradeceu. Naquele dia, além do peixe, trouxe para casa um aprendizado que valia para a vida inteira.',
    ],
  },
].map(withTimedData);

export function getStoryById(id) {
  return stories.find((story) => story.id === id);
}
