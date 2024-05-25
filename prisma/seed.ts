import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
    const categories = [
        'Desenvolvimento Pessoal', 'Geração Z', 'Desabafos', 'Relacionamentos', 'Autoajuda', 'Meditação e Mindfulness', 'Definição de Metas',
        'Gestão do Estresse', 'Ansiedade', 'Depressão', 'Bem-Estar Mental', 'Família', 'Parentalidade',
        'Amizade', 'Relacionamentos Românticos', 'Viagens', 'Aventuras', 'Hobbies e Interesses',
        'Fitness e Saúde', 'Poesia', 'Contos', 'Ensaios', 'Diário Pessoal', 'Gratidão', 'Reflexões Diárias',
        'Metas de Carreira', 'Equilíbrio entre Trabalho e Vida Pessoal', 'Experiências de Trabalho',
        'Educação', 'Dicas de Estudo', 'Realizações Acadêmicas', 'Tecnologia', 'Redes Sociais',
        'Impacto da Tecnologia', 'Tendências Tecnológicas', 'Eventos Atuais', 'Notícias', 'Questões Sociais',
        'Opiniões Políticas', 'Filosofia', 'Religião', 'Crenças Pessoais', 'Viagens Espirituais',
        'Pensamentos Filosóficos', 'Entretenimento', 'Resenhas de Livros', 'Filmes e Séries de TV', 'Música',
        'Arte', 'Natureza', 'Meio Ambiente', 'Sustentabilidade', 'Moda', 'Estilo de Vida', 'Alimentação Saudável',
        'Receitas', 'Culinária', 'Animais de Estimação', 'Jardinagem', 'Fotografia', 'Projetos de DIY (Faça Você Mesmo)',
        'Inspiração', 'Histórias de Vida', 'Superação', 'Amor-Próprio', 'Redução de Estresse', 'Minimalismo',
        'Organização Pessoal', 'Finanças Pessoais', 'Investimentos', 'Planejamento Financeiro', 'Economia',
        'Sustentabilidade Financeira', 'Empreendedorismo', 'Negócios', 'Startups', 'Inovação', 'Marketing',
        'Publicidade', 'Redes de Contatos', 'Eventos', 'Conferências', 'Cultura', 'História', 'Geografia',
        'Literatura', 'Filosofia da Vida', 'Espiritualidade', 'Meditação Guiada', 'Ioga', 'Reflexões sobre a Vida',
        'Documentação de Viagens', 'Memórias de Infância', 'Histórias de Família', 'Conquistas Pessoais', 'Desafios Diários',
        'Lições de Vida', 'Relatos Pessoais', 'Experiências de Vida', 'Reflexões sobre o Futuro', 'Planos para o Futuro',
        'Criatividade', 'Inovação Pessoal'
    ];

    const categoryData = categories.map((name) => ({ name }));

    await prisma.category.createMany({
        data: categoryData,
        skipDuplicates: true,
    });

    console.log('Categories has been added!');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
