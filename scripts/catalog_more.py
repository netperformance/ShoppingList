"""Erweiterung des Produktkatalogs: Dinge, die man in Supermarkt, Drogerie, Apotheke,
Baumarkt, Tierhandlung, Elektronik- und Kleidungsgeschäft einkauft. Keine Möbel, keine
seltenen Spezialgeräte. Je Kategorie eine Liste, Einträge durch Komma getrennt.
Wird von build-catalog.py eingelesen."""

MORE = {}

MORE["obst-gemuese"] = """
Äpfel, Birnen, Bananen, Orangen, Mandarinen, Clementinen, Zitronen, Limetten, Grapefruit, Pomelo, Kiwi, Mango, Ananas,
Papaya, Maracuja, Passionsfrucht, Granatapfel, Kaki, Feigen, Datteln (frisch), Litschi, Physalis, Kumquats, Drachenfrucht,
Kokosnuss, Weintrauben, Kernlose Trauben, Erdbeeren, Himbeeren, Brombeeren, Heidelbeeren, Johannisbeeren, Stachelbeeren,
Kirschen, Sauerkirschen, Pflaumen, Zwetschgen, Mirabellen, Aprikosen, Pfirsiche, Nektarinen, Plattpfirsiche, Melone,
Wassermelone, Honigmelone, Cantaloupe-Melone, Galiamelone, Rhabarber, Quitten, Cranberrys (frisch),
Kartoffeln, Festkochende Kartoffeln, Mehligkochende Kartoffeln, Drillinge, Frühkartoffeln, Süßkartoffeln, Zwiebeln,
Rote Zwiebeln, Gemüsezwiebeln, Schalotten, Frühlingszwiebeln, Lauchzwiebeln, Knoblauch, Ingwer, Kurkuma (frisch), Tomaten,
Cherrytomaten, Rispentomaten, Strauchtomaten, Fleischtomaten, Romatomaten, Datteltomaten, Gurke, Salatgurke, Minigurken,
Paprika, Rote Paprika, Gelbe Paprika, Grüne Paprika, Spitzpaprika, Peperoni, Chilischoten, Jalapeños, Möhren, Karotten,
Bundmöhren, Pastinaken, Petersilienwurzel, Knollensellerie, Staudensellerie, Lauch, Porree, Zucchini, Aubergine, Kürbis,
Hokkaido-Kürbis, Butternut-Kürbis, Brokkoli, Blumenkohl, Romanesco, Rosenkohl, Weißkohl, Rotkohl, Spitzkohl, Wirsing,
Grünkohl, Chinakohl, Pak Choi, Kohlrabi, Rote Bete, Radieschen, Rettich, Meerrettich, Steckrübe, Topinambur, Spargel,
Weißer Spargel, Grüner Spargel, Artischocken, Fenchel, Mais (Kolben), Zuckerschoten, Erbsenschoten, Grüne Bohnen,
Buschbohnen, Stangenbohnen, Edamame, Okra, Spinat, Babyspinat, Mangold, Rucola, Feldsalat, Eisbergsalat, Kopfsalat,
Romanasalat, Lollo Rosso, Lollo Bianco, Eichblattsalat, Endivie, Chicorée, Radicchio, Friséesalat, Pflücksalat,
Salatmischung, Kresse, Sprossen, Mungobohnensprossen, Champignons, Braune Champignons, Kräuterseitlinge, Austernpilze,
Shiitake, Pfifferlinge, Steinpilze, Avocado, Petersilie, Glatte Petersilie,
Krause Petersilie, Schnittlauch, Basilikum, Dill, Koriander, Minze, Rosmarin, Thymian, Salbei, Oregano (frisch), Estragon,
Kerbel, Liebstöckel, Zitronengras, Bärlauch, Kräutertopf, Suppengrün, Suppengemüse, Ofengemüse, Rohkost, Obstsalat,
Geschnittenes Obst, Snackgemüse, Bio-Obst, Bio-Gemüse, Maronen, Esskastanien
"""

MORE["brot"] = """
Brot, Mischbrot, Roggenbrot, Roggenmischbrot, Weizenbrot, Weißbrot, Vollkornbrot, Dinkelbrot, Dinkelvollkornbrot,
Sauerteigbrot, Bauernbrot, Kürbiskernbrot, Sonnenblumenkernbrot, Mehrkornbrot, Körnerbrot, Eiweißbrot, Low-Carb-Brot,
Glutenfreies Brot, Pumpernickel, Schwarzbrot, Knäckebrot, Zwieback, Ciabatta, Fladenbrot, Pide, Naan, Tortilla-Wraps,
Wraps, Pita, Toastbrot, Vollkorntoast, Sandwichtoast, Buttertoast, American Sandwich, Brötchen, Weizenbrötchen,
Kaiserbrötchen, Vollkornbrötchen, Körnerbrötchen, Mehrkornbrötchen, Dinkelbrötchen, Roggenbrötchen, Laugenbrötchen,
Laugenstange, Brezeln, Laugenbrezeln, Aufbackbrötchen, Baguettebrötchen, Ciabattabrötchen, Burgerbrötchen, Burger Buns,
Hot-Dog-Brötchen, Milchbrötchen, Rosinenbrötchen, Croissants, Buttercroissants, Schokocroissants, Laugencroissants,
Brioche, Hefezopf, Rosinenstuten, Stuten, Berliner, Krapfen, Donuts, Muffins, Franzbrötchen, Zimtschnecken, Plunder,
Apfeltasche, Quarktasche, Nussschnecke, Mohnschnecke, Streuselkuchen, Bienenstich, Käsekuchen, Apfelkuchen,
Marmorkuchen, Rührkuchen, Sandkuchen, Zitronenkuchen, Obstkuchen, Pflaumenkuchen, Torte, Sahnetorte, Obsttorte,
Tortenboden, Biskuitboden, Mürbeteigboden, Blätterteig, Pizzateig, Flammkuchenteig, Quiche-Teig, Strudelteig,
Filoteig, Yufka-Teig, Croissantteig, Hefeteig (frisch), Waffeln, Pfannkuchen (fertig), Crêpes, Lebkuchen, Stollen,
Christstollen, Panettone, Baumkuchen, Spekulatius, Printen, Paniermehl, Semmelbrösel, Croutons, Knödelbrot,
Grissini, Bruschetta-Brot, Partybrötchen, Mini-Brötchen, Pinsa, Bagels, English Muffins, Pancakes (fertig)
"""

MORE["kuehl"] = """
Milch, Vollmilch, Fettarme Milch, H-Milch, Frischmilch, Laktosefreie Milch, Weidemilch, Bio-Milch, Buttermilch, Kefir,
Ayran, Dickmilch, Sauermilch, Kakao (Milchgetränk), Milchshake, Eiskaffee (Kühlregal), Kaffeesahne, Kondensmilch,
Kaffeeweißer, Schlagsahne, Sahne, Kochsahne, Sprühsahne, Crème fraîche, Crème double, Schmand, Saure Sahne, Mascarpone,
Ricotta, Quark, Magerquark, Speisequark, Sahnequark, Kräuterquark, Skyr, Hüttenkäse, Körniger Frischkäse, Frischkäse,
Kräuterfrischkäse, Joghurt, Naturjoghurt, Griechischer Joghurt, Fruchtjoghurt, Joghurt (laktosefrei), Trinkjoghurt,
Joghurtdrink, Probiotischer Joghurt, Pudding, Schokopudding, Vanillepudding, Grießpudding, Milchreis (Kühlregal),
Desserts, Mousse au Chocolat, Panna Cotta, Butter, Süßrahmbutter, Sauerrahmbutter, Gesalzene Butter, Kräuterbutter,
Knoblauchbutter, Butterschmalz, Ghee, Margarine, Halbfettmargarine, Streichfett, Pflanzenbutter, Eier, Freilandeier,
Bio-Eier, Bodenhaltungseier, Wachteleier, Gekochte Eier, Flüssigei, Käse, Gouda, Junger Gouda, Mittelalter Gouda,
Alter Gouda, Emmentaler, Edamer, Tilsiter, Butterkäse, Leerdammer, Maasdamer, Bergkäse, Appenzeller, Gruyère,
Cheddar, Raclettekäse, Fondue-Käse, Brie, Camembert, Weichkäse, Ziegenkäse, Schafskäse, Feta, Hirtenkäse, Halloumi,
Grillkäse, Mozzarella, Büffelmozzarella, Burrata, Mini-Mozzarella, Pizzakäse, Reibekäse, Geriebener Käse, Parmesan,
Grana Padano, Pecorino, Gorgonzola, Blauschimmelkäse, Roquefort, Harzer Käse, Handkäse, Limburger, Romadur, Scheibenkäse,
Käsescheiben, Schmelzkäse, Schmelzkäseecken, Streichkäse, Hartkäse, Käseaufschnitt, Babybel, Obazda, Tofu, Räuchertofu,
Seidentofu, Tempeh, Seitan, Hummus, Guacamole, Tzatziki, Kräuterdip, Aufstriche (Kühlregal), Vegane Aufstriche,
Veganer Käse, Hafermilch, Hafer Barista, Sojamilch, Mandelmilch, Reismilch, Kokosmilch (Getränk), Erbsenmilch,
Sojajoghurt, Haferjoghurt, Kokosjoghurt, Pflanzliche Sahne, Hafersahne, Sojasahne, Frische Nudeln, Tortellini,
Ravioli (frisch), Gnocchi, Schupfnudeln, Spätzle, Maultaschen, Kloßteig, Kartoffelteig, Pizzateig (Kühlregal),
Blätterteig (Kühlregal), Croissant-Teig, Wiener Würstchen, Frankfurter Würstchen, Fleischwurst, Leberwurst, Teewurst,
Mettwurst, Salami, Cervelatwurst, Bierschinken, Lyoner, Mortadella, Kochschinken, Hinterschinken, Schwarzwälder Schinken,
Serranoschinken, Parmaschinken, Prosciutto, Bacon, Frühstücksspeck, Schinkenwürfel, Speckwürfel, Putenbrust (Aufschnitt),
Hähnchenbrust (Aufschnitt), Roastbeef (Aufschnitt), Pastrami, Leberkäse, Fleischsalat, Eiersalat, Kartoffelsalat,
Nudelsalat, Krautsalat, Heringssalat, Thunfischsalat, Geflügelsalat, Räucherlachs, Graved Lachs, Matjes, Bismarckhering,
Rollmops, Brathering, Krabben (Nordsee), Lachsforellenfilet (geräuchert), Makrele (geräuchert), Fertigsalat,
Salat to go, Sandwiches, Wraps (Kühlregal), Sushi (Kühlregal), Fertiggerichte (Kühlregal), Suppen (Kühlregal),
Hefe, Frischhefe, Orangensaft (Kühlregal), Smoothies, Veggie-Aufschnitt, Vegane Wurst, Veggie-Burger, Vegane Bratwurst,
Vegane Schnitzel, Falafel (Kühlregal)
"""

MORE["fleisch-fisch"] = """
Hackfleisch, Rinderhack, Schweinehack, Gemischtes Hackfleisch, Tatar, Mett, Hähnchenbrust, Hähnchenbrustfilet,
Hähnchenschenkel, Hähnchenkeulen, Hähnchenflügel, Chicken Wings, Hähnchen (ganz), Brathähnchen, Hähnchengeschnetzeltes,
Hähnchenleber, Putenbrust, Putenschnitzel, Putengeschnetzeltes, Putenkeule, Putenhack, Entenbrust, Ente, Gans, Gänsekeulen,
Rindersteak, Rumpsteak, Hüftsteak, Entrecôte, Ribeye-Steak, Filetsteak, Rinderfilet, Roastbeef, Rinderbraten,
Rindergulasch, Gulasch, Rinderrouladen, Rouladen, Suppenfleisch, Beinscheibe, Tafelspitz, Rinderbrust, Ochsenschwanz,
Schweineschnitzel, Schnitzel, Schweinefilet, Schweinelachs, Schweinenacken, Nackensteak, Kotelett, Schweinekotelett,
Schweinebauch, Schweinebraten, Krustenbraten, Kassler, Eisbein, Schweinshaxe, Spareribs, Rippchen, Schweinegulasch,
Geschnetzeltes, Gyros (roh), Kalbsschnitzel, Kalbfleisch, Kalbsleber, Lammkeule, Lammkoteletts, Lammlachse, Lammhack,
Wild, Rehrücken, Hirschgulasch, Wildschwein, Kaninchen, Bratwurst, Grillwurst, Rostbratwürstchen, Nürnberger Würstchen,
Thüringer Bratwurst, Weißwurst, Bockwurst, Currywurst, Merguez, Cevapcici, Frikadellen, Buletten, Grillfleisch,
Grillspieße, Schaschlik, Marinierte Steaks, Burger Patties, Hamburger, Fleischbällchen, Leber, Speck (am Stück),
Bauchspeck, Pancetta, Lachs, Lachsfilet, Lachsforelle, Forelle, Kabeljau, Seelachs, Rotbarsch, Dorade, Wolfsbarsch,
Pangasius, Tilapia, Zander, Scholle, Seezunge, Heilbutt, Makrele, Hering, Sardinen (frisch), Thunfischsteak, Schwertfisch,
Garnelen, Riesengarnelen, Shrimps, Scampi, Krabben, Muscheln, Miesmuscheln, Venusmuscheln, Jakobsmuscheln, Tintenfisch,
Calamari, Oktopus, Meeresfrüchte, Meeresfrüchtemischung, Fischfilet, Backfisch, Bio-Fleisch, Bio-Hähnchen, Wurst
"""

MORE["vorrat"] = """
Reis, Basmatireis, Jasminreis, Langkornreis, Vollkornreis, Parboiled Reis, Milchreis, Risottoreis, Sushireis, Wildreis,
Kochbeutelreis, Express-Reis, Nudeln, Spaghetti, Spaghettini, Linguine, Tagliatelle, Fettuccine, Penne, Rigatoni,
Fusilli, Farfalle, Makkaroni, Maccheroni, Orecchiette, Conchiglie, Tortiglioni, Lasagneplatten, Cannelloni, Bandnudeln,
Eiernudeln, Spätzle (trocken), Suppennudeln, Buchstabennudeln, Vollkornnudeln, Dinkelnudeln, Glutenfreie Nudeln,
Linsennudeln, Kichererbsennudeln, Glasnudeln, Reisnudeln, Mie-Nudeln, Udon-Nudeln, Soba-Nudeln, Ramen-Nudeln,
Instantnudeln, Couscous, Bulgur, Quinoa, Hirse, Polenta, Grieß, Hartweizengrieß, Amaranth, Buchweizen, Graupen,
Grünkern, Kartoffelpüree (Pulver), Kartoffelknödel (Packung), Semmelknödel (Packung), Kroketten (Pulver), Rösti (Packung),
Mehl, Weizenmehl Type 405, Weizenmehl Type 550, Dinkelmehl Type 630, Vollkornmehl, Roggenmehl, Mandelmehl, Kokosmehl,
Backmischung, Brotbackmischung, Kuchenbackmischung, Backpulver, Natron, Trockenhefe, Vanillezucker, Vanillinzucker,
Bourbon-Vanillezucker, Vanilleschote, Vanilleextrakt, Puddingpulver, Soßenpulver, Tortenguss, Gelatine, Agar-Agar,
Sahnesteif, Speisestärke, Zucker, Feinzucker, Rohrzucker, Puderzucker, Hagelzucker, Gelierzucker, Kandiszucker,
Würfelzucker, Brauner Zucker, Kokosblütenzucker, Süßstoff, Stevia, Erythrit, Xylit, Honig, Blütenhonig, Akazienhonig,
Waldhonig, Ahornsirup, Agavendicksaft, Dattelsirup, Zuckerrübensirup, Golden Syrup, Kuvertüre, Zartbitterkuvertüre,
Schokoladenstreusel, Schokotropfen, Zuckerstreusel, Lebensmittelfarbe, Backaromen, Zitronenaroma, Bittermandelaroma,
Rumaroma, Mandeln, Gemahlene Mandeln, Mandelblättchen, Mandelstifte, Haselnüsse, Gemahlene Haselnüsse, Walnüsse,
Cashewkerne, Pistazien, Pekannüsse, Macadamianüsse, Paranüsse, Erdnüsse, Pinienkerne, Kokosraspeln, Sonnenblumenkerne,
Kürbiskerne, Leinsamen, Chiasamen, Sesam, Hanfsamen, Mohn, Rosinen, Sultaninen, Korinthen, Getrocknete Aprikosen,
Getrocknete Pflaumen, Datteln, Getrocknete Feigen, Getrocknete Cranberrys, Getrocknete Mangos, Trockenobst, Studentenfutter,
Haferflocken, Zarte Haferflocken, Kernige Haferflocken, Dinkelflocken, Porridge, Overnight Oats, Müsli, Früchtemüsli,
Schokomüsli, Knuspermüsli, Granola, Cornflakes, Frühstücksflocken, Cerealien, Schokoflakes, Puffreis, Haferkleie,
Weizenkleie, Marmelade, Konfitüre, Erdbeermarmelade, Aprikosenkonfitüre, Kirschmarmelade, Orangenmarmelade, Gelee,
Pflaumenmus, Apfelmus, Nuss-Nougat-Creme, Nutella, Schokoaufstrich, Erdnussbutter, Mandelmus, Cashewmus, Tahin,
Brotaufstrich, Leberwurst (Glas), Kaffee, Kaffeebohnen, Gemahlener Kaffee, Filterkaffee, Espresso, Espressobohnen,
Kaffeepads, Kaffeekapseln, Nespresso-Kapseln, Dolce-Gusto-Kapseln, Löslicher Kaffee, Instantkaffee, Cappuccino-Pulver,
Latte-Macchiato-Pulver, Entkoffeinierter Kaffee, Getreidekaffee, Malzkaffee, Tee, Schwarztee, Grüner Tee, Früchtetee,
Kräutertee, Pfefferminztee, Kamillentee, Fencheltee, Rooibostee, Chai, Earl Grey, Ingwertee, Eistee-Pulver, Matcha,
Kakao, Kakaopulver, Trinkschokolade, Kaba, Ovomaltine, Öl, Sonnenblumenöl, Rapsöl, Olivenöl, Natives Olivenöl,
Kokosöl, Sesamöl, Leinöl, Walnussöl, Kürbiskernöl, Erdnussöl, Bratöl, Frittierfett, Essig, Weißweinessig, Rotweinessig,
Balsamico, Balsamico-Creme, Apfelessig, Kräuteressig, Reisessig, Essigessenz, Senf, Mittelscharfer Senf, Scharfer Senf,
Süßer Senf, Dijon-Senf, Ketchup, Curryketchup, Mayonnaise, Salatmayonnaise, Remoulade, Grillsoße, Barbecuesoße,
Cocktailsoße, Knoblauchsoße, Burgersoße, Currysoße, Sojasoße, Teriyakisoße, Süß-Sauer-Soße, Sweet-Chili-Soße,
Sriracha, Tabasco, Worcestersoße, Fischsoße, Austernsoße, Hoisinsoße, Pesto, Pesto Genovese, Rotes Pesto, Tomatensoße,
Pastasoße, Arrabbiata, Napoli-Soße, Bolognese (Glas), Passierte Tomaten, Stückige Tomaten, Geschälte Tomaten,
Tomatenmark, Pizzatomaten, Getrocknete Tomaten, Salatdressing, Salatkrönung, Fix-Produkte, Fix für Bolognese,
Fix für Gulasch, Fix für Lasagne, Brühe, Gemüsebrühe, Hühnerbrühe, Rinderbrühe, Fond, Bratensoße, Rahmsoße,
Hollandaise, Béchamel, Suppe, Tomatensuppe, Hühnersuppe, Kartoffelsuppe, Linsensuppe, Instantsuppe, Tütensuppe, Dosensuppe, Erbsensuppe (Dose), Gulaschsuppe (Dose), Ravioli (Dose),
Eintopf (Dose), Fertiggerichte, Konserven, Mais (Dose), Kidneybohnen, Weiße Bohnen, Schwarze Bohnen, Baked Beans,
Kichererbsen, Linsen, Rote Linsen, Berglinsen, Belugalinsen, Grüne Erbsen (Dose), Erbsen und Möhren, Bohnen (Glas),
Rotkohl (Glas), Sauerkraut, Gewürzgurken, Cornichons, Silberzwiebeln, Rote Bete (Glas), Mixed Pickles, Kapern,
Oliven, Grüne Oliven, Schwarze Oliven, Peperoni (Glas), Jalapeños (Glas), Artischockenherzen, Champignons (Dose),
Pilze (Glas), Spargel (Glas), Ananas (Dose), Pfirsiche (Dose), Mandarinen (Dose), Obstkonserven, Fruchtcocktail,
Kokosmilch, Kokoscreme, Thunfisch (Dose), Thunfisch in Öl, Thunfisch im eigenen Saft, Sardinen (Dose), Makrelen (Dose),
Heringsfilets in Tomatensoße, Lachs (Dose), Sardellen, Würstchen (Glas), Corned Beef, Frühstücksfleisch, Brotchips,
Reiswaffeln, Maiswaffeln, Knäckebrot (Vollkorn), Zwieback (Vollkorn), Tortilla-Chips, Taco-Schalen, Salsa, Salsa-Dip,
Currypaste, Rote Currypaste, Grüne Currypaste, Kokosflocken, Sushi-Nori, Wasabi, Eingelegter Ingwer, Reispapier,
Frühlingsrollenblätter, Babynahrung (Gläschen), Proteinpulver, Eiweißriegel, Müsliriegel, Energieriegel, Fruchtschnitten
"""

MORE["gewuerze"] = """
Salz, Speisesalz, Jodsalz, Meersalz, Ursalz, Himalayasalz, Fleur de Sel, Kräutersalz, Selleriesalz, Knoblauchsalz,
Pfeffer, Schwarzer Pfeffer, Weißer Pfeffer, Bunter Pfeffer, Pfeffermühle, Salzmühle, Cayennepfeffer, Chiliflocken,
Chilipulver, Paprikapulver, Paprika edelsüß, Paprika rosenscharf, Geräuchertes Paprikapulver, Curry, Currypulver,
Garam Masala, Kurkuma, Kreuzkümmel, Kümmel, Koriander (gemahlen), Kardamom, Zimt, Zimtstangen, Gewürznelken, Muskatnuss,
Piment, Lorbeerblätter, Wacholderbeeren, Sternanis, Fenchelsamen, Anis, Senfkörner, Bockshornklee, Ingwerpulver,
Knoblauchpulver, Granulierter Knoblauch, Zwiebelpulver, Röstzwiebeln, Getrocknete Zwiebeln, Oregano, Basilikum (getrocknet),
Thymian (getrocknet), Rosmarin (getrocknet), Majoran, Petersilie (getrocknet), Schnittlauch (getrocknet), Dill (getrocknet),
Salbei (getrocknet), Bohnenkraut, Estragon (getrocknet), Kräuter der Provence, Italienische Kräuter, TK-Kräuter,
Gewürzmischung, Grillgewürz, Steakgewürz, Hähnchengewürz, Gyrosgewürz, Fischgewürz, Kartoffelgewürz, Salatkräuter,
Pizzagewürz, Pastagewürz, Taco-Gewürz, Chili con Carne Gewürz, Ras el Hanout, Za'atar, Sumach, Harissa, Baharat,
Lebkuchengewürz, Spekulatiusgewürz, Glühweingewürz, Safran, Vanillepulver, Tonkabohne, Brühwürfel, Gemüsebrühe (Pulver),
Hefeflocken, Würzsoße, Maggi, Fondor, Liquid Smoke, Gewürzpaste, Knoblauchpaste, Ingwerpaste, Sambal Oelek, Gochujang,
Miso-Paste, Meerrettich (Glas), Wasabipaste
"""

MORE["suess"] = """
Schokolade, Vollmilchschokolade, Zartbitterschokolade, Weiße Schokolade, Nussschokolade, Ritter Sport, Milka,
Schokoriegel, Mars, Snickers, Twix, Bounty, Kitkat, Duplo, Hanuta, Kinder Riegel, Kinderschokolade, Kinder Überraschung,
Pralinen, Ferrero Rocher, Merci, Raffaello, Mon Chéri, Schokobons, Schokolinsen, M&Ms, Smarties, Schokoküsse, Dickmanns,
Gummibärchen, Fruchtgummi, Weingummi, Saure Gummis, Lakritz, Haribo, Bonbons, Lutscher, Kaugummi, Pfefferminz, Tic Tac,
Halsbonbons, Hustenbonbons, Karamellbonbons, Toffees, Marshmallows, Schaumzucker, Zuckerwatte, Brausepulver, Nougat,
Marzipan, Marzipankartoffeln, Krokant, Kekse, Butterkekse, Schokokekse, Doppelkekse, Oreo, Leibniz, Prinzenrolle,
Spritzgebäck, Cookies, Haferkekse, Vollkornkekse, Löffelbiskuits, Waffelröllchen, Waffeln (süß), Mannerschnitten,
Amerikaner, Kuchenriegel, Muffins (verpackt), Madeleines, Croissants (verpackt), Kuchen (verpackt), Biskuitrolle,
Chips, Paprikachips, Salzchips, Sour-Cream-Chips, Kesselchips, Gemüsechips, Linsenchips, Pringles, Erdnussflips, Flips,
Salzstangen, Brezeln (Snack), Cracker, Käsecracker, Salzgebäck, TUC, Popcorn, Mikrowellenpopcorn, Erdnüsse (geröstet),
Cashews (geröstet), Pistazien (geröstet), Nussmischung, Wasabi-Erbsen, Reiswaffeln (Schoko), Proteinriegel,
Schokoladenostereier, Schokoweihnachtsmann, Adventskalender, Osterhase (Schokolade), Lebkuchenherzen, Dominosteine,
Zimtsterne, Gebrannte Mandeln, Dessertsoße, Schokosoße, Karamellsoße, Eiswaffeln, Eishörnchen
"""

MORE["getraenke"] = """
Wasser, Mineralwasser, Stilles Wasser, Medium-Wasser, Sprudelwasser, Classic-Wasser, Heilwasser, Tafelwasser,
Wasser mit Geschmack, Saft, Orangensaft, Apfelsaft, Multivitaminsaft, Traubensaft, Ananassaft, Kirschsaft, Tomatensaft,
Karottensaft, Grapefruitsaft, Maracujasaft, Johannisbeersaft, Gemüsesaft, Direktsaft, Nektar, Bananennektar,
Pfirsichnektar, Apfelschorle, Johannisbeerschorle, Rhabarberschorle, Saftschorle, Limonade, Zitronenlimonade,
Orangenlimonade, Cola, Cola Zero, Cola light, Fanta, Sprite, Spezi, Mezzo Mix, Ginger Ale, Ginger Beer, Tonic Water,
Bitter Lemon, Eistee, Pfirsich-Eistee, Zitronen-Eistee, Mate, Club-Mate, Energydrink, Red Bull, Monster, Sportgetränk,
Isotonisches Getränk, Iso-Drink, Malzbier, Fassbrause, Bionade, Kombucha, Sirup, Getränkesirup, Holundersirup,
Himbeersirup, Wassersprudler-Sirup, Kohlensäurezylinder, Bier, Pils, Helles, Export, Weizenbier, Hefeweizen, Kristallweizen,
Radler, Alsterwasser, Alkoholfreies Bier, Alkoholfreies Weizen, Kölsch, Altbier, Dunkles Bier, Bockbier, Craft Beer,
Biermischgetränk, Cider, Wein, Rotwein, Weißwein, Roséwein, Riesling, Grauburgunder, Weißburgunder, Chardonnay,
Sauvignon Blanc, Merlot, Cabernet Sauvignon, Primitivo, Tempranillo, Chianti, Dornfelder, Lambrusco, Glühwein,
Alkoholfreier Wein, Sekt, Prosecco, Champagner, Crémant, Cava, Hugo, Aperol, Aperol Spritz, Campari, Lillet, Martini,
Wermut, Sherry, Portwein, Likör, Eierlikör, Baileys, Amaretto, Kräuterlikör, Jägermeister, Schnaps, Obstbrand,
Korn, Wodka, Gin, Rum, Weißer Rum, Brauner Rum, Whisky, Whiskey, Bourbon, Tequila, Ouzo, Grappa, Weinbrand, Cognac,
Sambuca, Mixgetränke, Cocktail-Mix, Alkoholfreier Gin, Pfand, Leergut, Getränkekiste, Wasserkiste, Bierkasten
"""

MORE["tiefkuehl"] = """
Pommes, Pommes frites, Backofen-Pommes, Wedges, Kroketten, Rösti, Kartoffelpuffer, Reibekuchen, Kartoffeltaschen,
Pizza, Tiefkühlpizza, Pizza Margherita, Pizza Salami, Steinofenpizza, Flammkuchen, Baguettes (TK), Lasagne (TK),
Fertiggerichte (TK), Pfannengerichte, Nasi Goreng (TK), Gemüsepfanne, Asia-Pfanne, Frühlingsrollen, Mini-Frühlingsrollen,
Dim Sum, Gyoza, Dumplings, Samosas, Fischstäbchen, Schlemmerfilet, Backfisch (TK), Lachsfilet (TK), Garnelen (TK),
Pangasiusfilet (TK), Seelachsfilet (TK), Chicken Nuggets, Hähnchenschnitzel (TK), Cordon bleu, Burger (TK), Hackbällchen (TK),
Ćevapčići (TK), Gemüse (TK), Erbsen (TK), Spinat (TK), Rahmspinat, Blattspinat (TK), Brokkoli (TK), Blumenkohl (TK),
Rosenkohl (TK), Grüne Bohnen (TK), Kaisergemüse, Buttergemüse, Suppengemüse (TK), Mais (TK), Edamame (TK), Rotkohl (TK),
Grünkohl (TK), Kräuter (TK), Petersilie (TK), Zwiebeln (TK), Knoblauch (TK), Beeren (TK), Himbeeren (TK), Heidelbeeren (TK),
Erdbeeren (TK), Waldbeeren (TK), Mango (TK), Obst (TK), Smoothie-Mix (TK), Eis, Speiseeis, Vanilleeis, Schokoeis,
Erdbeereis, Stracciatella, Eis am Stiel, Magnum, Cornetto, Eiscreme, Sorbet, Frozen Joghurt, Eistorte, Eiswürfel,
Crushed Ice, Brötchen zum Aufbacken (TK), Croissants (TK), Kuchen (TK), Torte (TK), Schwarzwälder Kirschtorte,
Blätterteig (TK), Strudel (TK), Apfelstrudel, Kaiserschmarrn (TK), Germknödel, Dampfnudeln, Waffeln (TK), Veggie-Burger (TK),
Falafel (TK), Gnocchi (TK), Tortellini (TK)
"""

MORE["drogerie"] = """
Zahnpasta, Zahncreme, Kinderzahnpasta, Zahnbürste, Elektrische Zahnbürste, Aufsteckbürsten, Zahnseide, Zahnzwischenraumbürsten,
Interdentalbürsten, Mundspülung, Zungenreiniger, Haftcreme, Gebissreiniger, Duschgel, Duschöl, Duschcreme, Seife, Flüssigseife,
Handseife, Seifennachfüller, Badezusatz, Badesalz, Badekugeln, Schaumbad, Shampoo, Anti-Schuppen-Shampoo, Trockenshampoo,
Spülung, Haarspülung, Haarkur, Haarmaske, Haaröl, Haarspray, Haargel, Haarwachs, Haarschaum, Haarfarbe, Tönung,
Blondierung, Haargummis, Haarspangen, Haarklammern, Haarbürste, Kamm, Deo, Deospray, Deoroller, Deostick, Antitranspirant,
Parfum, Eau de Toilette, Bodylotion, Körperlotion, Körpermilch, Körperbutter, Körperöl, Handcreme, Fußcreme, Gesichtscreme,
Tagescreme, Nachtcreme, Feuchtigkeitscreme, Augencreme, Serum, Gesichtsmaske, Peeling, Gesichtswasser, Mizellenwasser,
Reinigungsgel, Waschgel, Make-up-Entferner, Abschminktücher, Wattepads, Wattestäbchen, Watte, Lippenpflege, Labello,
Lippenbalsam, Lippenstift, Lipgloss, Make-up, Foundation, Concealer, Puder, Rouge, Bronzer, Highlighter, Mascara,
Wimperntusche, Eyeliner, Kajal, Lidschatten, Augenbrauenstift, Nagellack, Nagellackentferner, Nagelfeile, Nagelschere,
Nagelknipser, Pinzette, Rasierer, Einwegrasierer, Rasierklingen, Rasierschaum, Rasiergel, Aftershave, Bartöl, Rasierwasser,
Enthaarungscreme, Wachsstreifen, Sonnencreme, Sonnenspray, Sonnenschutz LSF 50, After-Sun, Selbstbräuner, Insektenschutz,
Mückenspray, Taschentücher, Papiertaschentücher, Kosmetiktücher, Feuchttücher, Feuchtes Toilettenpapier, Intimwaschlotion,
Tampons, Binden, Slipeinlagen, Menstruationstasse, Kondome, Gleitgel, Schwangerschaftstest, Rasierer für Damen,
Haarentferner, Kontaktlinsen, Kontaktlinsenflüssigkeit, Brillenputztücher, Ohrstöpsel, Duftkerzen, Raumduft, Duftstäbchen,
Fotoabzüge, Passbilder, Vitamine, Vitamin D, Vitamin C, Magnesium, Zink, Eisentabletten,
Multivitamin, Omega-3, Brausetabletten, Nahrungsergänzungsmittel, Proteinshake, Abnehmshake,
Haarschneidemaschine, Föhn, Glätteisen, Lockenstab, Schminkpinsel, Schwämmchen, Kulturbeutel, Reisegrößen,
Reiseshampoo, Hygienebeutel
"""

MORE["haushalt"] = """
Toilettenpapier, Klopapier, Küchenrolle, Küchenpapier, Servietten, Papierservietten, Taschentücher-Box, Müllbeutel,
Müllsäcke, Biomüllbeutel, Gelbe Säcke, Mülltüten 10 l, Mülltüten 35 l, Mülltüten 60 l, Gefrierbeutel, Frühstücksbeutel,
Zipperbeutel, Alufolie, Frischhaltefolie, Backpapier, Dauerbackfolie, Butterbrotpapier, Muffinförmchen, Backförmchen,
Grillschalen, Spülmittel, Handspülmittel, Spülmaschinentabs, Geschirrspültabs, Spülmaschinenpulver, Klarspüler,
Spülmaschinensalz, Regeneriersalz, Maschinenreiniger, Spülmaschinenpfleger, Schwämme, Spülschwämme, Spülbürste,
Topfreiniger, Stahlwolle, Spültücher, Schwammtücher, Mikrofasertücher, Putzlappen, Wischtücher, Bodentücher,
Allzweckreiniger, Universalreiniger, Badreiniger, Kalkreiniger, Entkalker, WC-Reiniger, Toilettenreiniger, WC-Steine,
WC-Duftspüler, Urinsteinentferner, Rohrreiniger, Abflussreiniger, Glasreiniger, Fensterreiniger, Bodenreiniger,
Laminatreiniger, Parkettpflege, Holzpflege, Möbelpolitur, Edelstahlreiniger, Backofenreiniger, Herdreiniger,
Ceranfeldreiniger, Fettlöser, Grillreiniger, Schimmelentferner, Desinfektionsmittel, Desinfektionstücher,
Handdesinfektion, Scheuermilch, Essigreiniger, Zitronensäure, Soda, Gallseife, Fleckentferner,
Waschmittel, Vollwaschmittel, Colorwaschmittel, Universalwaschmittel, Feinwaschmittel, Wollwaschmittel,
Schwarzwaschmittel, Waschpulver, Flüssigwaschmittel, Waschmittel-Caps, Weichspüler, Hygienespüler, Wäschestärke,
Bügelwasser, Farbfangtücher, Entkalker für Waschmaschine, Waschmaschinenreiniger, Trocknertücher, Wäscheklammern,
Wäscheleine, Wäschenetz, Wäschesack, Fusselrolle, Kleiderbügel, Mottenschutz, Schuhcreme, Schuhpflege, Imprägnierspray,
Schuheinlagen, Schnürsenkel, Staubsaugerbeutel, Staubtücher, Staubwedel, Besen, Handfeger, Kehrblech, Wischmopp,
Wischbezug, Putzeimer, Gummihandschuhe, Einweghandschuhe, Haushaltshandschuhe, Fliegenklatsche, Fliegenfänger,
Mückenstecker, Ameisenköder, Mausefalle, Insektenspray, Lufterfrischer, Raumspray, Geruchsentferner, Duftöl,
Kerzen, Teelichter, Stumpenkerzen, Tafelkerzen, Grablicht, Streichhölzer, Feuerzeug, Stabfeuerzeug, Grillanzünder,
Grillkohle, Holzkohle, Briketts, Kaminholz, Anzündholz, Batterien, AA-Batterien, AAA-Batterien, Knopfzellen,
9-Volt-Batterie, Akkus, Glühbirne, LED-Lampe, Leuchtmittel E27, Leuchtmittel E14, GU10-Lampe, Taschenlampe,
Verlängerungskabel, Mehrfachsteckdose, Klebeband, Paketband, Panzertape, Tesafilm, Sekundenkleber, Alleskleber,
Schere, Haushaltsschere, Messer, Küchenmesser, Schneidebrett, Dosenöffner, Flaschenöffner, Korkenzieher, Sparschäler,
Reibe, Schneebesen, Kochlöffel, Pfannenwender, Schöpfkelle, Sieb, Nudelsieb, Messbecher, Rührschüssel, Topf, Pfanne,
Auflaufform, Backform, Springform, Kastenform, Muffinblech, Brotdose, Frischhaltedosen, Vorratsdosen, Einmachgläser,
Trinkflasche, Thermosflasche, Kaffeefilter, Filtertüten, Wasserfilter, Filterkartuschen, Teefilter, Trinkhalme,
Pappteller, Pappbecher, Plastikbesteck, Einweggeschirr, Partybecher, Tischdecke, Geschirrtücher, Topflappen,
Ofenhandschuh, Spülbecken-Sieb, Abtropfgitter, Eiswürfelbeutel, Gläser, Becher, Tassen, Teller, Besteck,
Handtücher, Gästehandtücher, Duschvorhang, Badematte, Bettwäsche, Spannbettlaken, Kopfkissen, Bettdecke, Wolldecke,
Vorhänge, Fußmatte, Putzmittel, Reinigungsmittel, Spray-Flasche, Nachfüllpack
"""

MORE["baby"] = """
Windeln, Babywindeln, Windeln Größe 1, Windeln Größe 2, Windeln Größe 3, Windeln Größe 4, Windeln Größe 5,
Windeln Größe 6, Pants, Windelhöschen, Schwimmwindeln, Babytücher, Wundschutzcreme, Babyöl,
Babylotion, Babyshampoo, Babybad, Babypuder, Babycreme, Babyseife, Wickelunterlagen, Windelbeutel, Windeleimer-Nachfüllung,
Babynahrung, Babybrei, Gläschen, Obstbrei, Gemüsebrei, Milchbrei, Getreidebrei, Abendbrei, Quetschies, Quetschbeutel,
Babykekse, Säuglingsmilch, Pre-Nahrung, Anfangsmilch, Folgemilch, Kindermilch,
Babytee, Babywasser, Fläschchen, Babyflasche, Sauger, Schnuller, Schnullerkette, Beißring,
Lätzchen, Spucktücher, Mulltücher, Moltontücher, Stilleinlagen, Stillkissen, Brustwarzensalbe, Milchpumpe, Nasensauger, Babyzahnbürste, Babyzahnpasta, Babynagelschere,
Kinderpflaster, Babysocken, Strampler, Body, Babybody, Babymütze, Schlafsack, Spieluhr, Rassel, Kinderbesteck,
Kindergeschirr, Trinklernbecher, Kinderzahnbürste, Kindershampoo, Kindersonnencreme, Töpfchen, Toilettensitz (Kinder),
Kinderwagen-Zubehör, Babyphone-Batterien
"""

MORE["apotheke"] = """
Schmerztabletten, Ibuprofen, Paracetamol, Aspirin, Kopfschmerztabletten, Fiebersaft, Fieberzäpfchen, Erkältungsmittel,
Erkältungsbad, Erkältungstee, Hustensaft, Hustenlöser, Hustenstiller, Halstabletten, Lutschtabletten, Nasenspray,
Meerwasser-Nasenspray, Nasentropfen, Augentropfen, Ohrentropfen, Erkältungsbalsam, Wick VapoRub, Inhalationsmittel,
Allergietabletten, Antihistaminikum, Magentabletten, Sodbrennen-Tabletten, Durchfalltabletten, Elektrolyte,
Abführmittel, Verdauungstabletten, Kohletabletten, Reisetabletten, Schlaftabletten (pflanzlich), Baldrian,
Beruhigungstee, Johanniskraut, Wundsalbe, Wund- und Heilsalbe, Bepanthen, Brandsalbe, Kühlgel, Sportsalbe,
Schmerzgel, Wärmepflaster, Pflaster, Pflasterstrips, Blasenpflaster, Wundauflagen, Verbandmaterial, Mullbinden,
Elastische Binde, Kompressen, Desinfektionsspray, Wunddesinfektion, Jod-Salbe, Zeckenzange, Fieberthermometer,
Blutdruckmessgerät, Kühlpack, Wärmflasche, Erste-Hilfe-Set, Verbandskasten, FFP2-Masken, Mundschutz, Coronatest,
Schnelltest, Insulin, Teststreifen, Blutzuckerteststreifen, Lanzetten, Kompressionsstrümpfe, Hühneraugenpflaster,
Fußpilzcreme, Nagelpilzmittel, Lippenherpescreme, Akne-Creme, Neurodermitis-Creme, Rezept einlösen,
Medikamente, Tabletten, Vitamin B12, Folsäure, Calcium, Kalium, Probiotika, Ohrenstöpsel, Augenmaske, Lesebrille,
Pille, Verhütungsmittel, Ovulationstest, Hämorrhoidensalbe, Läusemittel, Reiseapotheke, Sonnenallergie-Gel,
Mückenstich-Gel, Antibrumm
"""

MORE["tier"] = """
Katzenfutter, Nassfutter (Katze), Trockenfutter (Katze), Katzensnacks, Katzenmilch, Katzengras, Katzenstreu,
Klumpstreu, Katzenklo, Kratzbaum, Katzenspielzeug, Hundefutter, Nassfutter (Hund), Trockenfutter (Hund), Hundesnacks,
Kauknochen, Hundeknochen, Kaustangen, Hundeleckerli, Kotbeutel, Hundekotbeutel, Hundeleine, Hundehalsband, Geschirr (Hund),
Hundespielzeug, Hundebett, Hundeshampoo, Zeckenschutz, Flohmittel, Wurmkur, Futternapf, Trinknapf,
Vogelfutter, Wildvogelfutter, Meisenknödel, Vogelsand, Kanarienfutter, Wellensittichfutter, Nagerfutter,
Kaninchenfutter, Meerschweinchenfutter, Hamsterfutter, Heu, Stroh, Kleintierstreu, Einstreu, Fischfutter,
Flockenfutter, Aquarium-Wasseraufbereiter, Schildkrötenfutter, Pferdeleckerli, Pferdefutter, Tierbedarf, Tierarztbedarf
"""

MORE["buero"] = """
Kugelschreiber, Kuli, Bleistift, Buntstifte, Filzstifte, Fineliner, Textmarker, Marker, Edding, Whiteboard-Marker,
Füller, Tintenpatronen, Tintenkiller, Radiergummi, Anspitzer, Lineal, Geodreieck, Zirkel, Schulheft, Heft, Collegeblock,
Notizblock, Notizbuch, Haftnotizen, Post-its, Karteikarten, Druckerpapier, Kopierpapier, Fotopapier, Druckerpatronen,
Toner, Briefumschläge, Briefmarken, Versandtaschen, Luftpolsterumschläge, Paketklebeband, Ordner, Aktenordner,
Schnellhefter, Klarsichthüllen, Prospekthüllen, Trennblätter, Register, Locher, Tacker, Heftklammern, Büroklammern,
Reißzwecken, Pinnadeln, Gummibänder, Kleber, Klebestift, Flüssigkleber, Tesafilm-Abroller, Korrekturroller, Cutter, Kalender, Terminkalender, Wandkalender, Glückwunschkarte, Geburtstagskarte, Grußkarte,
Trauerkarte, Postkarten, Geschenkpapier, Geschenkband, Geschenktüte, Schleifenband, Bastelpapier, Tonpapier, Fotokarton,
Wasserfarben, Malkasten, Pinsel, Acrylfarben, Knete, Bastelkleber, Glitzer, Schultüte, Schulranzen, Federmäppchen, Hausaufgabenheft, Zeichenblock, Malblock, Malbuch, Rätselheft, Zeitschrift, Zeitung, Buch,
Taschenbuch, Kinderbuch, Lesezeichen, Etiketten, Adressaufkleber, Namensschilder, Visitenkarten, Taschenrechner
"""

MORE["elektronik"] = """
USB-Kabel, USB-C-Kabel, Lightning-Kabel, Micro-USB-Kabel, Ladekabel, Ladegerät, USB-Ladegerät, Schnellladegerät,
Netzteil, Powerbank, Autoladegerät, Kabelloses Ladegerät, USB-Stick, Speicherkarte, SD-Karte, Micro-SD-Karte,
Externe Festplatte, SSD, HDMI-Kabel, Netzwerkkabel, LAN-Kabel, Adapter, USB-Adapter, Reiseadapter, Steckdosenadapter,
Kopfhörer, In-Ear-Kopfhörer, Bluetooth-Kopfhörer, Headset, Bluetooth-Lautsprecher, Lautsprecher, Handyhülle,
Displayschutzfolie, Panzerglas, Handyhalterung, Selfie-Stick, Smartwatch-Armband, Computermaus, Maus, Tastatur,
Mauspad, Webcam, Mikrofon, Druckerkabel, Router, WLAN-Repeater, Steckdosenleiste, Zeitschaltuhr, Smarte Steckdose,
Funksteckdose, Bewegungsmelder, Rauchmelder, Fernbedienung, Universalfernbedienung, TV-Kabel, Antennenkabel,
Wandhalterung, Batterieladegerät, Stirnlampe, Lichterkette, LED-Streifen, Nachtlicht, Wecker,
Radiowecker, Küchenwaage, Personenwaage, Wasserkocher, Toaster, Kaffeemaschine, Milchaufschäumer, Mixer, Pürierstab,
Handmixer, Sandwichmaker, Waffeleisen, Bügeleisen, Rasierapparat, Epilierer, Haartrockner, Ventilator, Heizlüfter,
Smarte Glühbirne, Spielekonsole-Controller, Videospiel, Gamepad, Gutscheinkarte, Prepaid-Karte, Guthabenkarte, SIM-Karte
"""

MORE["kleidung"] = """
Unterhemd, Unterhose, Unterwäsche, Boxershorts, Slip, Panty, String, BH, Sport-BH, Socken, Sneakersocken, Strumpfhose,
Kniestrümpfe, Thermosocken, Wollsocken, Sportsocken, Kompressionssocken, Hausschuhe, Pantoffeln, Badeschuhe, Flip-Flops,
Badelatschen, Sandalen, Turnschuhe, Sneaker, Laufschuhe, Sportschuhe, Gummistiefel, Winterstiefel, Stiefel, Halbschuhe,
Schuhe, Kinderschuhe, T-Shirt, Shirt, Langarmshirt, Poloshirt, Hemd, Bluse, Top, Tanktop, Pullover, Pulli, Hoodie,
Sweatshirt, Strickjacke, Cardigan, Fleecejacke, Jacke, Regenjacke, Winterjacke, Übergangsjacke, Weste, Mantel, Jeans,
Hose, Chino, Jogginghose, Leggings, Shorts, Kurze Hose, Rock, Kleid, Sommerkleid, Anzug, Krawatte, Gürtel, Pyjama,
Schlafanzug, Nachthemd, Bademantel, Badehose, Badeanzug, Bikini, Sportkleidung, Sporthose, Trainingsanzug, Mütze,
Wintermütze, Beanie, Schal, Loop-Schal, Halstuch, Handschuhe, Fäustlinge, Ohrenschützer, Cap, Basecap, Sonnenhut,
Sonnenbrille, Regenschirm, Taschenschirm, Handtasche, Rucksack, Sporttasche, Einkaufstasche, Jutebeutel, Geldbörse,
Portemonnaie, Uhr, Armbanduhr, Uhrenbatterie, Schmuck, Ohrringe, Haarreif, Kinderkleidung, Babykleidung, Matschhose,
Regenhose, Schneeanzug, Arbeitshose, Arbeitshandschuhe, Sicherheitsschuhe, Strumpfhalter, Nähset, Knöpfe, Nähgarn,
Sicherheitsnadeln, Bügelflicken, Reißverschluss
"""

MORE["baumarkt"] = """
Schrauben, Holzschrauben, Spax, Dübel, Nägel, Muttern, Unterlegscheiben, Gewindestangen, Haken, Bilderhaken,
Klebehaken, Wandhaken, Kabelbinder, Kabelkanal, Isolierband, Malerkrepp, Abdeckband, Abdeckfolie, Malervlies,
Wandfarbe, Weiße Wandfarbe, Dispersionsfarbe, Lack, Buntlack, Klarlack, Holzlasur, Holzschutz, Grundierung, Tiefengrund,
Farbroller, Farbwanne, Pinselset, Spachtel, Spachtelmasse, Füllspachtel, Gips, Moltofill, Silikon, Acryl-Dichtmasse,
Fugenmasse, Bauschaum, Montagekleber, Holzleim, Zweikomponentenkleber, Schleifpapier, Schleifschwamm, Sägeblatt,
Bohrer, Holzbohrer, Steinbohrer, Bits, Bitset, Akkuschrauber, Bohrmaschine, Hammer, Schraubenzieher, Schraubendreher,
Zange, Kombizange, Wasserpumpenzange, Inbusschlüssel, Schraubenschlüssel, Maulschlüssel, Wasserwaage, Zollstock,
Maßband, Cuttermesser, Teppichmesser, Ersatzklingen, Säge, Handsäge, Werkzeugkasten, Leiter, Trittleiter,
Schutzbrille, Gehörschutz, Staubmaske, Steckdose, Lichtschalter, Kabel, Lüsterklemmen, WAGO-Klemmen, Sicherungen, Außenleuchte, Türstopper, Türschloss, Vorhängeschloss, Zahlenschloss,
Schlüsselrohling, Türklinke, Scharniere, Möbelgriffe, Filzgleiter, Möbelfüße, Regalträger, Regalbrett, Winkel,
Lochband, Silikonspray, WD-40, Kriechöl, Schmierfett, Rostlöser, Rostschutz, Duschkopf, Duschschlauch,
Perlator, Dichtungen, Toilettendeckel, WC-Sitz, Spülkasten-Ersatzteile, Siphon, Abflusssieb, Pömpel, Saugglocke,
Rohrreinigungsspirale, Dachrinnenschutz, Tapete, Tapetenkleister, Raufaser, Fliesenkleber, Fliesenfugen, Laminat,
Trittschalldämmung, Sockelleisten, Teppich, Fußleisten, Gartenerde, Blumenerde, Pflanzerde, Kräutererde, Anzuchterde,
Rasensamen, Rasendünger, Dünger, Flüssigdünger, Blumendünger, Tomatendünger, Kompost, Rindenmulch, Mulch, Kies,
Sand, Spielsand, Pflanzkübel, Blumentopf, Übertopf, Blumenkasten, Pflanzen, Zimmerpflanzen, Kräuterpflanzen, Tomatenpflanzen,
Gemüsepflanzen, Blumenzwiebeln, Saatgut, Samen, Blumensamen, Gemüsesamen, Gießkanne, Gartenschlauch, Schlauchkupplung,
Rasensprenger, Gartenschere, Rosenschere, Heckenschere, Astschere, Rechen, Laubrechen, Harke, Spaten, Schaufel,
Pflanzschaufel, Grubber, Schubkarre, Gartenhandschuhe, Unkrautvernichter, Unkrautstecher, Fugenkratzer, Schneckenkorn,
Schädlingsbekämpfung, Pflanzenschutz, Rasenmäher-Zubehör, Mähfaden, Rasenkantenschere, Laubsäcke, Gartenabfallsack,
Komposter, Regentonne, Vogelhaus, Insektenhotel, Gartenfackeln, Solarleuchten, Gartenleuchten, Grill, Grillrost,
Grillbesteck, Grillzange, Grillbürste, Gasflasche, Grillabdeckung, Planschbecken, Poolchemie, Chlortabletten,
Streusalz, Splitt, Schneeschaufel, Eiskratzer, Enteiserspray, Frostschutz, Scheibenwischwasser, Motoröl, Autopolitur,
Autoshampoo, Felgenreiniger, Cockpitspray, Duftbaum, Fahrradschlauch, Fahrradschloss, Fahrradlicht, Fahrradpumpe,
Flickzeug, Kettenöl, Brennholz, Holzbriketts, Pellets, Heizöl
"""

MORE["sonstiges"] = """
Blumen, Blumenstrauß, Rosen, Tulpen, Topfpflanze, Orchidee, Geschenk, Geschenkgutschein, Gutschein, Mitbringsel,
Partydeko, Luftballons, Girlanden, Konfetti, Geburtstagskerzen, Wunderkerzen, Tischdeko,
Partyhüte, Feuerwerk, Raketen, Böller, Spielzeug, Puzzle, Brettspiel, Kartenspiel, Spielkarten, Lego, Kuscheltier,
Seifenblasen, Kreide, Straßenkreide, Sandspielzeug, Wasserpistole, Schwimmflügel, Wasserball, Lose, Lotto, Zigaretten,
Tabak, Zigarettenpapier, Zigarettenfilter, E-Zigarette, Liquid, Zigarren, Nikotinkaugummi,
Paket abholen, Paket abgeben, Schlüssel nachmachen, Reinigung abholen, Schuhe zum Schuster, Fahrkarte, Parkschein,
Tankfüllung, Pfandbon, Geld abheben, Bargeld
"""
