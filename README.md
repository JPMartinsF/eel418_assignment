# UFRJ CRID - Contrato Inteligente de Matrículas

## Descrição
Contrato inteligente para gerenciamento do sistema CRID (Confirmação de Inscrição em Disciplinas) da UFRJ, implementando:

- Criação de disciplinas por administradores
- Fluxo de estados de matrícula: `PENDENTE → CONFIRMADA ↔ TRANCADA`
- Controle automático de vagas disponíveis
- Transições de estado seguras com mensagens claras de erro

## Estrutura do Projeto
    eel418_assignment/
    ├── contracts/ # Códigos dos contratos
    │ └── UFRJ_CRID.sol # Contrato principal
    ├── test/unit/ # Testes
    │ └── UFRJ_CRID.test.js # Testes completos
    ├── scripts/ # Scripts auxiliares
    │ ├── deploy.js # Script de implantação
    │ └── verify.js # Verificação em block explorers
    └── hardhat.config.js # Configuração do ambiente

## Funcionalidades

### Administração
- Criação de disciplinas com capacidade máxima definida
- Acesso restrito ao endereço administrador

### Matrículas
- Três estados possíveis:
  - `PENDENTE`: Matrícula inicial
  - `CONFIRMADA`: Matrícula validada
  - `TRANCADA`: Matrícula cancelada

- Regras de transição:
  - Confirmação apenas a partir de `PENDENTE`
  - Trancamento permitido de qualquer estado exceto `TRANCADA`
  - Vagas são automaticamente liberadas ao trancar

## Testes
Suite completa de testes cobrindo:
- Criação e validação de disciplinas
- Fluxo completo de matrículas
- Validações de estado e capacidade
- Mensagens de erro específicas

## CI/CD

Pipeline automatizada com:

- Execução de testes em todos os pushes
- Geração de relatório de cobertura
- Verificação de padrões de código
