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
- [x] Chave secreta da conta Stripe salva
- [x] Aviso automático criado no Stripe (endereço + eventos de pagamento)
- [ ] Chave de assinatura do aviso (whsec_...) salva na loja — o dono copia do painel do Stripe
- [ ] PIX e boleto ativados nas configurações de pagamento do Stripe (hoje só cartão aparece)
- [ ] Publicar a loja para o Stripe conseguir avisar (o endereço público ainda responde 404)

## Depois
- Criar categorias, marcas e objetivos pelo painel
- [x] Testar painel com conta real (login, lista, busca, editar, enviar foto, páginas de cliente)
