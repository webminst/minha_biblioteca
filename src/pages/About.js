import React from 'react';
import './About.css'; // Importaremos o CSS para estilização

const About = () => {
  // Ajuste o caminho da imagem conforme onde você a salvou
  // Se estiver em public/images/, o caminho é relativo à raiz do site
  const profileImageUrl = '/images/pastor-foto.jpeg'; // Exemplo

  return (
    <div className="about-container">
      <h1>Sobre Mim</h1>

      <section className="about-intro">
        {/* Imagem do Pastor */}
        <img
          src={profileImageUrl}
          alt="Foto do Pastor Giovanni" // Coloque seu nome aqui
          className="about-photo"
        />
        {/* Parágrafo Introdutório */}
        <div className="intro-text">
          <p>
            Eu sou <b>Giovanni Moreira Guimarães</b>, pastor da Igreja Presbiteriana do Brasil,
            e é uma alegria recebê-lo neste espaço onde compartilho meus sermões, estudos 
            bíblicos e resumos de livros. Minha paixão é contemplar a beleza e a profundidade 
            das Escrituras, ajudando pessoas a crescerem em seu relacionamento com Cristo. 
            Abaixo, um rápido testemunho da <b>Minha Jornada de Fé</b> para motivá-lo a
            prosseguir na sua própria caminhada. Se desejar, entre em contato para conversarmos 
            mais sobre a Palavra de Deus. 
            </p>
          {/* Pode adicionar mais um parágrafo introdutório se desejar */}
        </div>
      </section>

      <section className="about-section">
        <h2>Minha Jornada de Fé</h2>
        <p>Apesar de não vir de uma família com forte tradição religiosa, desde muito cedo tive um interesse pela vida de fé. Ainda na infância recebi o convite de um amigo (José Claudinei dos Santos) para ser coroinha na Igreja de São Sebastião (Caçapava-SP), onde comecei a dar meus primeiros passos na caminhada de fé. A preparação para a cerimônia de confirmação (Crisma) e o envolvimento em outras atividades como retiros espirituais e encontros com outros pré-adolescentes e adolescentes despertou em mim certa atração pelas coisas de Deus. Nessa época, com minha iniciação na leitura da Palavra de Deus, algumas dúvidas também começaram a surgir, especialmente sobre temas como idolatria, confissão auricular, perdão de pecados e penitência.</p> 
        <p>Foi no início de 1985, quando iniciei o curso técnico em Mecânica (ETESG Machado de Assis) que conheci o Henrique. Henrique era um homem casado, por volta de 35 anos, que na época trabalhava na Engesa, uma pessoa formidável. Rapidamente nos tornamos colegas de escola. Ele frequentava a Igreja Presbiteriana do Brasil em Caçapava, e frequentemente me fazia convites para que eu visitasse sua igreja. Confesso que na época achava que “os crentes” eram todos “um bando de subversivos” que queria acabar com a Igreja Católica. Não gostava deles. Mas a amizade com Henrique, dia após dia, ia me revelando uma pessoa diferente. Seus constantes e insistentes convites foram, como diz o ditado diz, “água mole em pedra dura”.</p>
        <p>Certa vez, ele me convidou para ir ao aniversário da Igreja. Na ocasião, viria um pastor de fora (Rev. Miguel Ângelo Garcia) e seria um final de semana festivo. Pensei comigo: vou aproveitar a ocasião, visitar a igreja dele e “pagar essa dívida”, depois poderei recusar convites futuros com mais propriedade.</p>
        <p>Qual não foi minha surpresa...</p>
        <p>Na data e hora marcada cheguei à Igreja, sozinho, sem conhecer nada nem ninguém, apenas o Henrique, que estava à minha espera, próximo à entrada da Igreja, junto de sua família. Ele me recebeu, me apresentou a algumas pessoas e fomos logo sentar num dos bancos, no meio da igreja. </p>
        <p>O ambiente do culto era diferente, não sei explicar o que me aconteceu. As músicas (lembro-me de: “Solta o cabo da nau, toma os remos nas mãos e navega com fé em Jesus...”), a pregação do pastor, a comunhão dos irmãos... aquilo tudo preencheu meu coração e serviu de combustível ao Espírito Santo que o fez arder como fogo. Quando o pastor fez o apelo, sem que ninguém me constrangesse, eu me levantei do banco e fui à frente. Glória a Deus. Bendito dia aquele que o Senhor me chamou.</p>
        <p>Desde então, passei a me considerar “um crente”. Encontrei respostas para as minhas primeiras questões teológicas e fui me inserindo naquela comunidade totalmente nova para mim, conhecendo outras pessoas maravilhosas, dentre elas não posso me esquecer de Eufrásio Rodrigues de Oliveira Filho, na época presbítero da Igreja, hoje pastor, que tanto me ajudou nos meus anos iniciais.</p>
        <p>Mas a vida tem caminhos e descaminhos. Depois de algum tempo frequentando a igreja comecei a me afastar gradativamente, inicialmente devido a uma série de compromissos: trabalho, escola, vida social com amigos e paqueras. O fato de ser o único evangélico em casa até então também colaborou para isso.</p> 
        <p>Esse afastamento da igreja me afastou de Cristo e de sua palavra, fazendo-me experimentar alguns dos pecados do mundo, mas o Senhor teve misericórdia de mim e por sua graça trouxe-me de volta à comunhão dos santos na Igreja Presbiteriana de Mossoró.</p>
        <p>Cheguei em Mossoró em 1992. O Brasil vivia uma crise terrível. Desemprego, altos índices de inflação, incertezas políticas. Desempregado e vivendo uma tremenda crise existencial, fui para Mossoró a passeio por sugestão de minha mãe, para visitar e conhecer a família. Vi nessa sugestão a direção de Deus para meu retorno ao convívio com os irmãos.</p>
        <p>Já no caminho, arrependido, vinha prometendo a Deus voltar ao rebanho de Cristo, andar nos seus santos caminhos. Ao chegar, fui bem recebido pelos familiares e, através do Nilton, esposo da minha tia Graça, consegui de imediato um emprego. Procurei logo a Igreja na cidade e encontrei a Igreja Presbiteriana Central de Mossoró, que fica próximo à casa da minha Tia.</p>
        <p>Na Igreja Presbiteriana Central de Mossoró recomecei minha caminhada de fé, com a ajuda de muitos irmãos, entre eles: Moura Jr., Rivanildo Medeiros, Airton Andrade, Aurino Dantas, Expedito Holanda, Odilon Teodósio e tantos outros cujos nomes Deus sabe e os recompensará na glória.</p>
        <p>Alguns momentos foram marcantes na minha trajetória, certamente o mais importante deles foi conhecer Abilene, que depois viria a se tornar minha esposa. Ela foi fundamental para o meu crescimento espiritual. Filha de pastor e com forte aspiração à obra missionária, ela chegou a se formar no Instituto Bíblico do Norte. Abilene acreditou em mim antes de qualquer outra pessoa.</p>
        <p>Com Abilene compartilhei minhas mazelas, meus sonhos, alegrias e frustrações. Confesso que, em alguns momentos, cheguei a pensar que ela não suportaria. Hoje, já compartilhamos vinte e oito anos de casamento e um casal de filhos: a Giulia e o Arthur.</p>
        <p>Ao longo dos anos, sempre frequentando assiduamente aos trabalhos da Igreja e procurando aprender com os irmãos, Deus foi colocando em meu coração o desejo de servir em sua causa. Participei de cursos para professores de Escola Dominical, e de evangelismo como Evangelismo Explosivo. Fui professor e superintendente de Escola Dominical e comecei a ensaiar minhas primeiras pregações nas casas dos irmãos e nos pontos de pregação.</p>
        <p>Vale ressaltar o apoio e a participação do Rev. Anselmo e Aldenisa, sua esposa, na minha vida. O pastor Anselmo, meu sogro, sempre foi um referencial de vida e ministério para mim. Moura Jr., foi fundamental nesse processo. Quantas e quantas vezes não fui à sua casa para tirar dúvidas e ser aconselhado. Serei eternamente grato por sua influência em minha vida.</p>
      </section>

      <section className="about-section">
        <h2>Chamado para o Ministério</h2>
        <p>Acredito que meu chamado efetivo para o ministério tenha ocorrido numa programação de aniversário da então congregação do Planalto, hoje Igreja Presbiteriana do Planalto, em Mossoró. Lembro-me que na ocasião o pregador, depois de expor o texto de Isaías 6, fez um apelo e no meu íntimo, impactado pela mensagem, respondi também: “Envia-me a mim”. Depois desse episódio passei a considerar o ministério e compartilhei isso com meu pastor e com Abilene. Entretanto, sentia que precisava conhecer mais a Palavra de Deus e a doutrina da Igreja para servir melhor. Foram três longos anos como aspirante ao sagrado ministério até ser aprovado pelo Conselho da Igreja e pelo Presbitério para ser enviado ao Seminário Presbiteriano do Norte, em Recife-PE, em fevereiro de 1997.</p>
        <p>Ordenado ao sagrado ministério em dezembro de 2000, minha jornada pastoral começou na Primeira Igreja Presbiteriana de Santarém (PA), onde servi por dois anos, seguida por seis anos na Igreja Presbiteriana de Caicó (RN). Em 2009, retornei a Mossoró, servindo inicialmente como pastor auxiliar na Igreja Central e, depois, por seis anos na Igreja Presbiteriana do Carnaubal. Subsequentemente, ministrei atos pastorais nas igrejas de Ipanguaçu e Novo Horizonte (Assú), e também nas de Barrocas e Redenção. Servi ainda por seis anos como pastor na Igreja Presbiteriana da Redenção e, nos últimos anos, tenho atuado como pastor auxiliar na Igreja Presbiteriana de Barrocas. Paralelamente, no âmbito do presbitério, tive o privilégio de servir como presidente em duas legislaturas, como vice-presidente em quatro, como secretário executivo em outras seis legislaturas e como primeiro e segundo secretário por duas legislaturas.</p>
      </section>

      <section className="about-section">
        <h2>Formação Acadêmica e Teológica</h2>
        <p>Formado em Teologia pelo Seminário Presbiteriano do Norte, em 2000, concluí uma especialização em Administração Eclesiástica em 2009 e em 2014 realizei o curso para a revalidação do Diploma de Bacharel em Teologia na Universidade Presbiteriana Mackenzie. Por fim, em 2021 cursei o Centro de Treinamento Missiológico (CTM-SPN), sendo habilitado como plantador de igrejas nos projetos da IPB. Vale mencionar também minha graduação em Ciência da Computação pela Universidade Federal Rural do Semi Árido (Ufersa) em 2023, uma formação que hoje considero valiosa por me auxiliar a usar ferramentas digitais para o avanço do Reino.</p>
        {/* Pode usar uma lista <ul> se preferir:
        <ul>
          <li>Bacharel em Teologia - Seminário Presbiteriano X (Ano Y)</li>
          <li>Bacharel em Ciência da Computação - Universidade Z (Ano W)</li>
          <li>[Outras formações, cursos, pós-graduações relevantes]</li>
        </ul>
        */}
      </section>

      <section className="about-section">
        <h2>Paixão pelo Ensino da Palavra</h2>
        <p>Toda essa jornada, desde as primeiras dúvidas na infância até os anos de ministério pastoral e formação teológica, convergiu para uma profunda paixão pelo ensino da Palavra de Deus. Essa paixão não é apenas um interesse intelectual, mas o motor que impulsiona meu serviço a Cristo e à Sua Igreja, e se fundamenta em alguns pilares essenciais:</p>
          <li><b>Fidelidade ao sistema de doutrina presbiteriano e reformado:</b> Minha caminhada começou com questionamentos que encontraram respostas sólidas na teologia reformada. Encontrei no sistema doutrinário presbiteriano uma estrutura robusta, bíblica e coerente para compreender a soberania de Deus, a centralidade de Cristo, a obra do Espírito Santo e a autoridade das Escrituras. Essa fidelidade não é um tradicionalismo cego, mas uma convicção firmada no estudo e na experiência de que esta tradição expressa de forma fiel o ensino bíblico. É neste rico solo teológico que busco nutrir minha própria fé e a fé daqueles a quem sirvo.</li>
          <li><b>Compromisso com a Confissão de Fé de Westminster:</b> Como expressão madura e detalhada da fé reformada, meu compromisso com a Confissão de Fé de Westminster e seus Catecismos Maior e Breve é fundamental. Vejo esses documentos como ferramentas valiosíssimas, não para substituir a Bíblia, mas para auxiliar na sua compreensão e ensino sistemático. Eles são um guia seguro que resume as doutrinas essenciais da fé cristã, protege a Igreja de erros teológicos e oferece uma base sólida para a instrução, o discipulado e a vida piedosa. Meu ministério busca refletir essa herança confessional, prezando pela sã doutrina.</li>
          <li><b>Ênfase na pregação expositiva e ensino confessional:</b> Acredito firmemente que a maneira mais eficaz e fiel de alimentar o rebanho de Cristo é através da pregação expositiva, que busca desvendar o significado do texto bíblico em seu contexto original e aplicá-lo à vida contemporânea. Permitir que a Palavra de Deus fale por si mesma, expondo seu sentido de forma clara e ordenada, é meu objetivo a cada sermão. Da mesma forma, no ensino em Escola Dominical, grupos de estudo ou discipulado, busco um ensino confessional, alinhado com nossas bases doutrinárias, para que os crentes cresçam no conhecimento de Deus e sejam edificados sobre um fundamento seguro. Minhas primeiras experiências ensinando nas casas e pontos de pregação já apontavam para essa convicção que só se fortaleceu ao longo dos anos.</li>
          <li><b>Visão missionária e plantação de igreja:</b> O ensino fiel da Palavra não pode estar desassociado do imperativo missionário de Cristo. A compreensão da grandeza de Deus e da Sua graça salvadora deve nos impulsionar a levar o Evangelho a todos os povos. Por isso, cultivo uma visão missionária que anseia pela expansão do Reino de Deus. A plantação de novas igrejas é uma estratégia vital nesse processo, criando novas comunidades onde a Palavra é pregada, os sacramentos administrados e os crentes são discipulados. A formação específica no CTM-SPN veio reforçar esse chamado e me equipar melhor para esse desafio. Utilizar todos os dons e ferramentas disponíveis, inclusive os conhecimentos adquiridos na área de Ciência da Computação, para alcançar mais pessoas e apoiar o estabelecimento de novas frentes de trabalho, é parte integrante dessa visão.</li>
        <p>Ensinar a Palavra, fundamentado nestes princípios, é para mim mais do que um dever ministerial; é a expressão da minha gratidão a Deus por Sua maravilhosa graça em minha vida, um privilégio que busco exercer com temor, zelo e amor pela verdade que liberta e transforma. Que o Senhor me conceda graça para continuar fiel a este chamado até o fim.</p>
      </section>

      {/* Opcional: Seção para fotos adicionais (ministério, família, etc.) */}
      {/*
      <section className="about-gallery">
        <h2>Galeria</h2>
        <div className="gallery-images">
          <img src="/images/foto-ministerio-1.jpg" alt="Foto do Ministério 1" />
          <img src="/images/foto-familia-1.jpg" alt="Foto da Família" />
          </div>
      </section>
      */}

    </div>
  );
};

export default About;