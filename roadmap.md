# Roadmap

## Contas de clientes
- [x] Banco: perfis, endereços, favoritos, pedidos, cupons, avaliações, pedidos de exclusão
- [x] Entrar/criar conta (e-mail + Google), recuperar senha
- [x] Área "Minha conta": dados, endereços, pedidos (status + rastreio + recomprar), favoritos, cupons, avaliações, privacidade/excluir conta
- [x] Finalizar compra gravando pedido
- [x] Painel: pedidos (status/rastreio), cupons, exclusões de conta
- [x] Conta do dono da loja (rubens.kelvin2015@gmail.com) com acesso ao painel
- [ ] E-mails de atualização do pedido — aguardando domínio de e-mail do usuário

## Cobrança online (Stripe na conta do dono)
- [x] Colunas de pagamento no pedido (sessão e intenção de cobrança)
- [x] Criar cobrança PIX/cartão/boleto a partir do pedido e levar o cliente para pagar
- [x] Aviso automático do Stripe aprovando o pedido pago
- [x] Botão "Pagar agora" e avisos de pago/não concluído na página do pedido
- [ ] Chave secreta da conta Stripe (sk_test_...) salva — a enviada até agora é a pública (pk_test_...)
- [ ] Endereço do aviso (webhook) e chave de assinatura configurados no Stripe

## Depois
- Criar categorias, marcas e objetivos pelo painel
- [x] Testar painel com conta real (login, lista, busca, editar, enviar foto, páginas de cliente)
