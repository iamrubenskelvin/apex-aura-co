CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_first_admin AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  sku text NOT NULL DEFAULT '',
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  rating numeric(2,1) NOT NULL DEFAULT 5,
  reviews integer NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT 'whey',
  badge text,
  best_seller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  stock_total integer,
  stock integer NOT NULL DEFAULT 0,
  goals text[] NOT NULL DEFAULT '{}',
  flavors text[] NOT NULL DEFAULT '{}',
  weights text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ativo',
  sales integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at date NOT NULL DEFAULT current_date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active products" ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'ativo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.products (id,slug,sku,name,brand,category,subcategory,tag,description,price,old_price,rating,reviews,image,badge,best_seller,is_new,stock_total,stock,goals,flavors,weights,tags,status,sales,created_at,sort_order) VALUES
('whey-iso','whey-isolate-pro-900g','FN-WHEYISO','Whey Isolate Pro 900g','Forja Prime','Whey Protein','Whey Isolado','Massa magra','Proteína isolada por filtração cruzada, com alta concentração proteica e baixa lactose.',189.9,249.9,4.9,2841,'whey','-24%',true,false,400,68,ARRAY['Ganho de massa','Hipertrofia','Recuperação','Definição muscular']::text[],ARRAY['Chocolate','Morango','Baunilha','Cookies']::text[],ARRAY['450g','900g','2kg']::text[],ARRAY['proteína','isolado','pós-treino','low carb']::text[],'ativo',3120,'2026-05-02',0),
('creatina','creatina-monohidratada-300g','FN-CREATINA','Creatina Monohidratada 300g','Forja Prime','Creatina','Monohidratada','Força','Creatina monohidratada micronizada, sem sabor, com pureza certificada por lote.',129.9,159.9,5,4102,'creatine','-19%',true,false,500,42,ARRAY['Hipertrofia','Performance','Ganho de massa']::text[],ARRAY['Neutro']::text[],ARRAY['150g','300g','500g']::text[],ARRAY['força','potência','creapure']::text[],'ativo',4890,'2026-04-11',1),
('pre-treino','pre-treino-ignite-300g','FN-PRETREIN','Pré-Treino Ignite 300g','Ignite Labs','Pré-Treino','Com cafeína','Energia','Pré-treino de rótulo aberto com 200 mg de cafeína e 3,2 g de beta-alanina por dose.',149.9,199.9,4.8,1673,'preworkout','-25%',false,false,300,95,ARRAY['Performance','Energia']::text[],ARRAY['Frutas Vermelhas','Limão Siciliano','Uva','Melancia']::text[],ARRAY['300g']::text[],ARRAY['cafeína','beta-alanina','foco']::text[],'ativo',1980,'2026-06-20',2),
('bcaa','bcaa-2-1-1-120-caps','FN-BCAA','BCAA 2:1:1 — 120 caps','Forja Prime','Aminoácidos','BCAA','Recuperação','Aminoácidos de cadeia ramificada em cápsulas, na proporção 2:1:1.',89.9,NULL,4.7,934,'bcaa',NULL,false,false,250,120,ARRAY['Recuperação','Performance']::text[],ARRAY['Neutro']::text[],ARRAY['60 caps','120 caps']::text[],ARRAY['aminoácidos','cápsulas','2:1:1']::text[],'ativo',1140,'2026-03-18',3),
('hipercalorico','mass-gainer-3kg','FN-HIPERCAL','Mass Gainer 3kg','Titan Fuel','Hipercalórico','Mass Gainer','Volume','Mistura de carboidratos e proteínas para fechar a meta calórica em fase de volume.',219.9,279.9,4.6,712,'mass','-21%',false,false,200,31,ARRAY['Ganho de massa','Hipertrofia']::text[],ARRAY['Chocolate','Baunilha']::text[],ARRAY['1,5kg','3kg']::text[],ARRAY['volume','calorias','bulking']::text[],'ativo',860,'2026-02-27',4),
('termogenico','termogenico-burn-100-caps','FN-TERMOGEN','Termogênico Burn 100 caps','Ignite Labs','Termogênicos','Cafeína','Definição','Cápsulas com cafeína e extratos vegetais para dar suporte à fase de definição.',99.9,139.9,4.5,1288,'thermo','-29%',true,false,350,57,ARRAY['Emagrecimento','Definição muscular','Energia']::text[],ARRAY['Neutro']::text[],ARRAY['60 caps','100 caps']::text[],ARRAY['cafeína','definição','cápsulas']::text[],'ativo',1520,'2026-06-05',5),
('multivitaminico','multivitaminico-daily-90-caps','FN-MULTIVIT','Multivitamínico Daily 90 caps','Vita Core','Vitaminas','Multivitamínicos','Imunidade','Multivitamínico completo com 23 vitaminas e minerais em dose diária única.',79.9,NULL,4.8,1540,'vitamin',NULL,false,false,400,180,ARRAY['Saúde e bem-estar','Recuperação']::text[],ARRAY['Neutro']::text[],ARRAY['90 caps']::text[],ARRAY['vitaminas','imunidade','diário']::text[],'ativo',1710,'2026-01-30',6),
('barra-proteica','barra-proteica-choco-12un','FN-BARRAPRO','Barra Proteica Choco 12un','Forja Prime','Barras','Barras proteicas','Praticidade','Barra com 20 g de proteína e cobertura de chocolate, ideal para lanches.',69.9,89.9,4.7,613,'bar','-22%',false,false,600,210,ARRAY['Recuperação','Definição muscular','Saúde e bem-estar']::text[],ARRAY['Chocolate','Cookies','Morango']::text[],ARRAY['12un']::text[],ARRAY['snack','praticidade','lanche']::text[],'ativo',740,'2026-07-09',7),
('whey-conc-1kg','whey-concentrado-80-1kg','FN-WHEYCONC','Whey Concentrado 80% 1kg','NorteNutri','Whey Protein','Whey Concentrado','Massa magra','Whey concentrado com 24 g de proteína por dose e ótimo custo por grama.',149.9,189.9,4.6,1204,'whey','-21%',false,false,630,210,ARRAY['Ganho de massa','Hipertrofia']::text[],ARRAY['Chocolate','Baunilha','Morango']::text[],ARRAY['900g','1kg']::text[],ARRAY['proteína','concentrado']::text[],'ativo',2100,'2026-03-05',8),
('whey-hidro','whey-hidrolisado-900g','FN-WHEYHIDR','Whey Hidrolisado 900g','Peak Origin','Whey Protein','Whey Hidrolisado','Recuperação','Proteína pré-digerida, de absorção acelerada e teor mínimo de lactose.',259.9,319.9,4.8,640,'whey','-19%',false,true,102,34,ARRAY['Recuperação','Hipertrofia']::text[],ARRAY['Baunilha','Chocolate']::text[],ARRAY['900g']::text[],ARRAY['proteína','hidrolisado','rápida absorção']::text[],'ativo',520,'2026-06-28',9),
('whey-blend-2kg','whey-blend-3w-2kg','FN-WHEYBLEN','Whey Blend 3W 2kg','Raw Athletics','Whey Protein','Blends','Massa magra','Blend de proteínas concentrada, isolada e hidrolisada em uma só fórmula.',279.9,NULL,4.5,410,'whey',NULL,false,false,3,0,ARRAY['Ganho de massa']::text[],ARRAY['Chocolate','Cookies']::text[],ARRAY['2kg']::text[],ARRAY['proteína','blend']::text[],'ativo',300,'2026-02-14',10),
('whey-veg','proteina-vegetal-900g','FN-WHEYVEG','Proteína Vegetal 900g','Vita Core','Whey Protein','Blends','Massa magra','Blend de ervilha e arroz com perfil de aminoácidos completo.',179.9,209.9,4.4,288,'whey','-14%',false,true,264,88,ARRAY['Saúde e bem-estar','Recuperação']::text[],ARRAY['Baunilha','Neutro']::text[],ARRAY['900g']::text[],ARRAY['vegano','proteína vegetal']::text[],'ativo',260,'2026-07-02',11),
('creatina-500','creatina-micronizada-500g','FN-CREATINA','Creatina Micronizada 500g','Peak Origin','Creatina','Micronizada','Força','Creatina micronizada em embalagem econômica de 500 g.',199.9,239.9,4.9,1870,'creatine','-17%',true,false,228,76,ARRAY['Hipertrofia','Performance']::text[],ARRAY['Neutro']::text[],ARRAY['500g']::text[],ARRAY['força','micronizada']::text[],'ativo',2450,'2026-04-22',12),
('creatina-caps','creatina-em-capsulas-120-caps','FN-CREATINA','Creatina em Cápsulas 120 caps','Forja Prime','Creatina','Monohidratada','Força','Creatina monohidratada em cápsulas para quem prefere praticidade.',119.9,NULL,4.6,520,'creatine',NULL,false,false,420,140,ARRAY['Hipertrofia','Performance']::text[],ARRAY['Neutro']::text[],ARRAY['120 caps']::text[],ARRAY['força','cápsulas','praticidade']::text[],'ativo',610,'2026-05-19',13),
('pre-sem-cafeina','pre-treino-zero-cafeina-300g','FN-PRESEMCA','Pré-Treino Zero Cafeína 300g','Ignite Labs','Pré-Treino','Sem cafeína','Energia','Fórmula de pump sem estimulantes, indicada para treinos noturnos.',139.9,NULL,4.5,372,'preworkout',NULL,false,false,186,62,ARRAY['Performance']::text[],ARRAY['Limão Siciliano','Uva']::text[],ARRAY['300g']::text[],ARRAY['sem cafeína','pump','noturno']::text[],'ativo',340,'2026-06-11',14),
('beta-alanina','beta-alanina-200g','FN-BETAALAN','Beta-Alanina 200g','Raw Athletics','Pré-Treino','Com cafeína','Energia','Beta-alanina pura para suporte à resistência em séries longas.',109.9,129.9,4.4,218,'preworkout','-15%',false,false,135,45,ARRAY['Performance','Energia']::text[],ARRAY['Neutro']::text[],ARRAY['200g']::text[],ARRAY['beta-alanina','resistência']::text[],'ativo',190,'2026-05-27',15),
('cafeina-caps','cafeina-210mg-60-caps','FN-CAFEINAC','Cafeína 210mg 60 caps','Ignite Labs','Pré-Treino','Com cafeína','Energia','Cafeína anidra em cápsulas com dose padronizada.',59.9,NULL,4.7,905,'preworkout',NULL,false,false,900,300,ARRAY['Energia','Performance','Emagrecimento']::text[],ARRAY['Neutro']::text[],ARRAY['60 caps']::text[],ARRAY['cafeína','foco']::text[],'ativo',1230,'2026-01-15',16),
('mass-6kg','mass-gainer-extreme-6kg','FN-MASS6KG','Mass Gainer Extreme 6kg','Titan Fuel','Hipercalórico','Mass Gainer','Volume','Versão econômica de 6 kg para fases longas de volume.',349.9,429.9,4.5,380,'mass','-19%',false,false,54,18,ARRAY['Ganho de massa']::text[],ARRAY['Chocolate','Baunilha','Morango']::text[],ARRAY['6kg']::text[],ARRAY['bulking','calorias']::text[],'ativo',410,'2026-02-02',17),
('maltodextrina','maltodextrina-1kg','FN-MALTODEX','Maltodextrina 1kg','NorteNutri','Hipercalórico','Carboidratos','Energia','Carboidrato de rápida absorção para uso intra e pós-treino.',49.9,NULL,4.3,240,'mass',NULL,false,false,780,260,ARRAY['Energia','Ganho de massa']::text[],ARRAY['Neutro','Laranja']::text[],ARRAY['1kg']::text[],ARRAY['carboidrato','intra-treino']::text[],'ativo',520,'2026-01-08',18),
('glutamina','glutamina-300g','FN-GLUTAMIN','Glutamina 300g','Forja Prime','Aminoácidos','Glutamina','Recuperação','L-glutamina pura, sem sabor, para suporte à recuperação.',89.9,109.9,4.6,615,'bcaa','-18%',false,false,390,130,ARRAY['Recuperação','Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['300g']::text[],ARRAY['glutamina','imunidade']::text[],'ativo',700,'2026-03-29',19),
('eaa','eaa-essential-250g','FN-EAA','EAA Essential 250g','Peak Origin','Aminoácidos','EAA','Recuperação','Nove aminoácidos essenciais em pó, para uso intra-treino.',149.9,NULL,4.7,330,'bcaa',NULL,false,true,162,54,ARRAY['Recuperação','Hipertrofia']::text[],ARRAY['Frutas Vermelhas','Limão Siciliano']::text[],ARRAY['250g']::text[],ARRAY['aminoácidos essenciais','intra-treino']::text[],'ativo',280,'2026-07-16',20),
('bcaa-po','bcaa-em-po-200g','FN-BCAAPO','BCAA em Pó 200g','Raw Athletics','Aminoácidos','BCAA','Recuperação','BCAA 2:1:1 em pó com boa solubilidade.',79.9,NULL,4.2,190,'bcaa',NULL,false,false,3,0,ARRAY['Recuperação']::text[],ARRAY['Uva','Melancia']::text[],ARRAY['200g']::text[],ARRAY['bcaa','pó']::text[],'ativo',150,'2026-02-20',21),
('omega3','omega-3-tg-120-caps','FN-OMEGA3','Ômega 3 TG 120 caps','Vita Core','Vitaminas','Ômegas','Imunidade','Óleo de peixe na forma triglicerídea, com alta concentração de EPA e DHA.',99.9,119.9,4.8,1080,'vitamin','-17%',false,false,570,190,ARRAY['Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['120 caps']::text[],ARRAY['ômega','epa','dha']::text[],'ativo',1400,'2026-01-22',22),
('vitamina-d','vitamina-d3-2000ui-120-caps','FN-VITAMINA','Vitamina D3 2000UI 120 caps','Vita Core','Vitaminas','Minerais','Imunidade','Vitamina D3 em cápsulas softgel de dose diária.',49.9,NULL,4.9,1450,'vitamin',NULL,true,false,960,320,ARRAY['Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['120 caps']::text[],ARRAY['vitamina d','imunidade']::text[],'ativo',1980,'2026-02-10',23),
('zma','zma-90-caps','FN-ZMA','ZMA 90 caps','Forja Prime','Vitaminas','Minerais','Recuperação','Zinco, magnésio e vitamina B6 para suporte ao descanso.',69.9,NULL,4.4,410,'vitamin',NULL,false,false,288,96,ARRAY['Recuperação','Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['90 caps']::text[],ARRAY['zinco','magnésio','sono']::text[],'ativo',430,'2026-04-04',24),
('termo-liquido','termogenico-liquido-60ml','FN-TERMOLIQ','Termogênico Líquido 60ml','Ignite Labs','Termogênicos','Cafeína','Definição','Fórmula concentrada em gotas, com dosagem ajustável.',79.9,99.9,4.3,350,'thermo','-20%',false,false,66,22,ARRAY['Emagrecimento','Definição muscular']::text[],ARRAY['Neutro']::text[],ARRAY['60ml']::text[],ARRAY['termogênico','líquido']::text[],'ativo',380,'2026-05-08',25),
('cla','cla-1000mg-90-caps','FN-CLA','CLA 1000mg 90 caps','NorteNutri','Termogênicos','Ácidos graxos','Definição','Ácido linoleico conjugado em cápsulas softgel.',59.9,NULL,4.1,260,'thermo',NULL,false,false,450,150,ARRAY['Emagrecimento']::text[],ARRAY['Neutro']::text[],ARRAY['90 caps']::text[],ARRAY['cla','definição']::text[],'ativo',290,'2026-03-12',26),
('barra-nuts','barra-proteica-nuts-12un','FN-BARRANUT','Barra Proteica Nuts 12un','Ferro & Fibra','Barras','Barras proteicas','Praticidade','Barra com castanhas, 20 g de proteína e baixo teor de açúcares.',74.9,94.9,4.6,320,'bar','-21%',false,false,720,240,ARRAY['Definição muscular','Saúde e bem-estar']::text[],ARRAY['Amendoim','Cookies']::text[],ARRAY['12un']::text[],ARRAY['barra','snack']::text[],'ativo',420,'2026-06-25',27),
('pasta-amendoim','pasta-de-amendoim-proteica-1kg','FN-PASTAAME','Pasta de Amendoim Proteica 1kg','Ferro & Fibra','Barras','Snacks','Praticidade','Pasta integral com proteína adicionada e sem açúcar refinado.',44.9,NULL,4.7,890,'bar',NULL,false,false,525,175,ARRAY['Ganho de massa','Saúde e bem-estar']::text[],ARRAY['Chocolate','Neutro']::text[],ARRAY['1kg']::text[],ARRAY['pasta','amendoim']::text[],'ativo',960,'2026-04-30',28),
('coqueteleira','coqueteleira-forja-700ml','FN-COQUETEL','Coqueteleira Forja 700ml','Forja Prime','Acessórios','Coqueteleiras','Praticidade','Coqueteleira com mola misturadora, tampa vedante e escala em ml.',39.9,49.9,4.8,1330,'creatine','-20%',false,false,1200,400,ARRAY['Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['700ml']::text[],ARRAY['coqueteleira','shaker']::text[],'ativo',2200,'2026-01-05',29),
('porta-caps','porta-capsulas-semanal','FN-PORTACAP','Porta Cápsulas Semanal','Forja Prime','Acessórios','Organizadores','Praticidade','Organizador semanal com sete compartimentos independentes.',24.9,NULL,4.5,210,'creatine',NULL,false,false,3,0,ARRAY['Saúde e bem-estar']::text[],ARRAY['Neutro']::text[],ARRAY['Unidade']::text[],ARRAY['organizador','cápsulas']::text[],'ativo',180,'2026-02-18',30);