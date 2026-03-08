export const stories = [
  {
    id: 'luz-do-sertao',
    titulo: 'A Luz do Sertao',
    autor: 'Ana Bezerra',
    nivel: 'Iniciante',
    duracao: '5 min',
    descricao: 'Uma menina descobre como as lamparinas unem uma vila em noite de festa.',
    cover: '/capas/luz-do-sertao.jpg',
    audio: '/audio/luz-do-sertao.mp3',
    paragrafos: [
      'No fim da tarde, Maria riscou o pe da chinela no chao de barro e sentiu o vento quente passar pela rua. Era dia de novena, e a vila inteira se preparava para acender lamparinas na praca.',
      'Ela correu com a avo ate a janela da venda. Enquanto arrumavam os copos de cajuina, ouviam o zabumbaio distante do trio que vinha da feira. Cada som parecia chamar mais gente para perto.',
      'Quando a noite chegou, Maria percebeu que nenhuma lamparina brilhava sozinha. Uma acendia a outra, de mao em mao. Foi ali que entendeu: a luz do sertao fica mais forte quando todo mundo cuida dela junto.',
    ],
  },
  {
    id: 'o-cordel-da-chuva',
    titulo: 'O Cordel da Chuva',
    autor: 'Seu Antero Lima',
    nivel: 'Intermediario',
    duracao: '6 min',
    descricao: 'Um poeta de feira recita versos que anunciam a primeira chuva do ano.',
    cover: '/capas/o-cordel-da-chuva.jpg',
    audio: '/audio/o-cordel-da-chuva.mp3',
    paragrafos: [
      'Seu Antero abriu a mala de madeira logo cedo. Dentro, havia folhetos de cordel com capas coloridas e barbante novo para pendurar tudo na barraca.',
      'No meio da manha, ele subiu num caixote e comecou a declamar. Falou de nuvem grossa, cheiro de terra molhada e do povo sorrindo com o primeiro pingo na janela.',
      'Antes do ultimo verso, o ceu escureceu de verdade. A chuva caiu mansa, como se acompanhasse a rima. A feira inteira bateu palma, e o cordel virou memoria de um dia esperado por meses.',
    ],
  },
  {
    id: 'sanfona-na-varanda',
    titulo: 'Sanfona na Varanda',
    autor: 'Rita e Joana',
    nivel: 'Iniciante',
    duracao: '4 min',
    descricao: 'Duas amigas aprendem a tocar um baiao simples com o avo da rua.',
    cover: '/capas/sanfona-na-varanda.jpg',
    audio: '/audio/sanfona-na-varanda.mp3',
    paragrafos: [
      'Rita e Joana sentaram na varanda de madeira com os pes balancando no ar. O avo Chico apoiou a sanfona no colo e pediu silencio para ouvir o compasso da rua.',
      'Primeiro veio um toque curto, depois outro mais comprido. As meninas repetiram na palma da mao, rindo quando erravam. O avo dizia que musica boa e feita de paciencia e escuta.',
      'Ao anoitecer, o baiao saiu inteiro. Os vizinhos encostaram no portao para acompanhar, e a varanda virou palco. Rita percebeu que aprender tambem pode ser festa.',
    ],
  },
  {
    id: 'barco-de-jangada',
    titulo: 'Barco de Jangada',
    autor: 'Pedro do Mar',
    nivel: 'Avancado',
    duracao: '7 min',
    descricao: 'Um jovem jangadeiro aprende com a mae a ler os sinais do mar.',
    cover: '/capas/barco-de-jangada.jpg',
    audio: '/audio/barco-de-jangada.mp3',
    paragrafos: [
      'Pedro acordou antes do sol e caminhou ate a praia com a mae, carregando rede e coragem. O mar estava liso, mas ela apontou o horizonte e falou das mudancas escondidas no vento.',
      'Enquanto ajeitavam a jangada, ela ensinou a observar gaivotas, correnteza e o brilho da agua. Cada detalhe era uma palavra de um idioma antigo, passado de familia em familia.',
      'Na volta, com peixe fresco no balaio, Pedro entendeu que ler o mar parecia ler um livro vivo: toda pagina mudava rapido, mas quem presta atencao encontra caminho seguro para voltar.',
    ],
  },
];

export function getStoryById(id) {
  return stories.find((story) => story.id === id);
}
