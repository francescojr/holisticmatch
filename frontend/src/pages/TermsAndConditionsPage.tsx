/**
 * Terms and Conditions Page
 * Displays the platform's terms of use and legal information
 */

import { motion } from 'framer-motion'
import { pageVariants, containerVariants, itemVariants } from '../lib/animations'

function TermsAndConditionsPage() {
  const sections = [
    {
      id: '1',
      title: '1. Definições',
      content: `HolisticMatch: Plataforma de classificados para divulgação de profissionais de terapias holísticas.
Usuário: Toda pessoa que acessa, navega, exibe ou utiliza o site, incluindo visitantes e profissionais cadastrados.`
    },
    {
      id: '2',
      title: '2. Objeto',
      content: `O HolisticMatch é uma plataforma que permite a busca e divulgação de profissionais de terapias holísticas. Não há intermediação, execução, pagamento ou contratação de serviços pela plataforma. Toda negociação e contato são diretos entre usuário e profissional.`
    },
    {
      id: '3',
      title: '3. Cadastro e Informações Pessoais',
      content: `Profissionais podem se cadastrar inserindo dados pessoais como nome, CPF (opcional), email, telefone, cidade, estado, descrição, serviços e foto. Usuários visitantes não precisam de cadastro para utilizar a busca.

Ao fornecer seus dados, o profissional declara estar ciente de que essas informações ficarão públicas no site e que é responsável pela veracidade e atualização dos dados fornecidos.`
    },
    {
      id: '4',
      title: '4. Consentimento e Uso dos Dados',
      content: `O usuário autoriza a coleta e tratamento dos dados pessoais fornecidos para fins exclusivos de exibição e funcionamento do site, conforme previsto na Lei Geral de Proteção de Dados (LGPD).

Utilizamos cookies para autenticação e funcionalidades do site. Futuramente, poderá haver integração com ferramentas de análise (analytics). O usuário pode gerenciar os cookies através do navegador.`
    },
    {
      id: '5',
      title: '5. Responsabilidades e Isenção',
      content: `O HolisticMatch não é parte nas negociações, contratos ou relações entre usuários e profissionais, não se responsabilizando por quaisquer problemas, acordos ou serviços.

Os usuários são inteiramente responsáveis pelo conteúdo cadastrado e pelos contatos realizados, assumindo os riscos decorrentes.

Reservamo-nos o direito de moderar, editar ou remover conteúdos considerados inadequados, ofensivos ou ilegais, mas não garantimos moderação prévia.

O HolisticMatch atua estritamente como uma plataforma de divulgação de profissionais e não assume qualquer responsabilidade pelas informações fornecidas por estes, tampouco pelos serviços por eles prestados. O usuário utiliza o site por sua livre e exclusiva responsabilidade, isentando a plataforma de quaisquer demandas, prejuízos, perdas ou responsabilidades decorrentes do uso do site ou das negociações realizadas entre os usuários.`
    },
    {
      id: '6',
      title: '6. Conduta do Usuário',
      content: `É proibido cadastrar ou divulgar informações falsas, ilícitas, discriminatórias ou que violem direitos de terceiros. O descumprimento pode resultar em exclusão do perfil e bloqueio do acesso.`
    },
    {
      id: '7',
      title: '7. Propriedade Intelectual',
      content: `Os conteúdos do site, como layout, textos, imagens e logos são protegidos por direitos autorais. A reprodução sem autorização é proibida.`
    },
    {
      id: '8',
      title: '8. Foro',
      content: `Este termo é regido pela legislação brasileira e qualquer controvérsia será resolvida no foro da Comarca de São Paulo/SP.`
    },
    {
      id: '9',
      title: '9. Contato',
      content: `Dúvidas, solicitações ou reclamações relacionadas a este termo devem ser enviadas para: suporte@hollisticmatch.online`
    }
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light dark:bg-background-dark"
    >
      {/* Header Section */}
      <motion.div
        variants={containerVariants}
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-4"
          >
            Termos de Uso
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-100 max-w-2xl"
          >
            Bem-vindo ao HolisticMatch. Leia atentamente estes termos antes de usar nossa plataforma.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <motion.div
            variants={itemVariants}
            className="mb-12 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              Este documento poderá ser atualizado a qualquer momento, sendo a versão vigente sempre a disponível na plataforma. Ao continuar utilizando o site, você concorda com eventuais atualizações.
            </p>
          </motion.div>

          {/* Sections */}
          <motion.div
            variants={containerVariants}
            className="space-y-8"
          >
            {sections.map((section) => (
              <motion.section
                key={section.id}
                variants={itemVariants}
                className="prose dark:prose-invert max-w-none"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.split('\n\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}
          </motion.div>

          {/* Acceptance Info */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
              ✓ Aceitação dos Termos
            </h3>
            <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
              Ao cadastrar como profissional ou utilizar os serviços do HolisticMatch, você concorda integralmente com estes Termos de Uso. Se não concordar com qualquer disposição deste termo, não utilize nossa plataforma.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Dúvidas?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Se você tiver dúvidas sobre estes termos, entre em contato conosco:
            </p>
            <a
              href="mailto:suporte@hollisticmatch.online"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              suporte@hollisticmatch.online
            </a>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TermsAndConditionsPage
