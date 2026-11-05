"""Baut src/domain/catalog.json aus dem Katalog der alten App (scripts/products-alt.json).
Ergänzt fehlende Alltagsprodukte, entfernt Tippfehler und Doppelte.
Die englischen Namen stehen in scripts/catalog_en.tsv (deutscher Name, Tabulator, englischer Name).
Fehlt dort ein Produkt, erscheint es nur in den deutschen Vorschlägen; das Skript nennt es am Ende.
Aufruf: python3 scripts/build-catalog.py
"""
import json, pathlib, unicodedata
from catalog_more import MORE

root = pathlib.Path(__file__).resolve().parent.parent
old = {c["title"]: c["produkte"] for c in json.loads((root / "scripts/products-alt.json").read_text(encoding="utf-8"))}

# Reihenfolge = typischer Weg durch einen Supermarkt (lässt sich in der App ändern)
categories = [
    ("obst-gemuese", "Obst & Gemüse", "Fruit & Vegetables", "🥦", "Obst & Gemüse"),
    ("brot", "Brot & Backwaren", "Bread & Bakery", "🥖", "Brot & Backwaren"),
    ("kuehl", "Milch, Käse & Eier", "Dairy & Eggs", "🧀", "Milch & Käse"),
    ("fleisch-fisch", "Fleisch & Fisch", "Meat & Fish", "🥩", "Fleisch & Fisch"),
    ("vorrat", "Vorrat", "Pantry", "🍝", "Grundnahrungsmittel"),
    ("gewuerze", "Gewürze & Kräuter", "Spices & Herbs", "🌿", "Gewürze"),
    ("suess", "Süßes & Snacks", "Sweets & Snacks", "🍫", "Süßigkeiten"),
    ("getraenke", "Getränke", "Drinks", "🥤", "Getränke"),
    ("tiefkuehl", "Tiefkühl", "Frozen", "🧊", "Tiefkühlprodukte"),
    ("drogerie", "Drogerie", "Personal Care", "🧴", "Körperpflege & Drogerie"),
    ("haushalt", "Haushalt", "Household", "🧽", "Haushalt"),
    ("baby", "Baby", "Baby", "🍼", "Baby & Kleinkind"),
    ("apotheke", "Apotheke", "Pharmacy", "💊", None),
    ("tier", "Tierbedarf", "Pet Supplies", "🐾", None),
    ("buero", "Schreibwaren & Büro", "Stationery & Office", "✏️", None),
    ("elektronik", "Elektronik", "Electronics", "🔌", None),
    ("kleidung", "Kleidung & Schuhe", "Clothing & Shoes", "👕", None),
    ("baumarkt", "Baumarkt & Garten", "Hardware & Garden", "🔨", None),
    ("sonstiges", "Sonstiges", "Other", "🛍️", "Sonstiges & Büro"),
]

extra = {
    "obst-gemuese": ["Kartoffeln", "Zwiebeln", "Knoblauch", "Tomaten", "Gurke", "Paprika", "Möhren", "Salat", "Äpfel", "Bananen", "Zitronen", "Avocado", "Pilze", "Champignons", "Ingwer", "Lauch", "Zucchini", "Brokkoli", "Spinat", "Weintrauben", "Erdbeeren", "Blaubeeren"],
    "brot": ["Brot", "Brötchen", "Toast", "Baguette", "Laugenbrezel", "Kuchen"],
    "kuehl": ["Milch", "Butter", "Eier", "Käse", "Joghurt", "Quark", "Sahne", "Schmand", "Saure Sahne", "Frischkäse", "Mozzarella", "Parmesan", "Feta", "Gouda", "Margarine", "Hafermilch", "Tofu", "Hummus"],
    "fleisch-fisch": ["Hähnchenbrust", "Schinken", "Aufschnitt", "Lachs", "Thunfisch", "Garnelen", "Speck"],
    "vorrat": ["Reis", "Nudeln", "Mehl", "Zucker", "Haferflocken", "Müsli", "Kaffee", "Tee", "Öl", "Olivenöl", "Essig", "Senf", "Ketchup", "Mayonnaise", "Marmelade", "Honig", "Nutella", "Erdnussbutter", "Konserven", "Mais (Dose)", "Bohnen (Dose)"],
    "gewuerze": ["Pfeffer", "Salz", "Paprikapulver", "Curry", "Zimt", "Muskat", "Chili"],
    "suess": ["Schokolade", "Chips", "Gummibärchen", "Kekse", "Nüsse", "Salzstangen", "Popcorn", "Eis"],
    "getraenke": ["Wasser", "Sprudel", "Saft", "Bier", "Wein", "Rotwein", "Weißwein", "Sekt", "Limonade", "Eistee", "Apfelschorle"],
    "tiefkuehl": ["Pommes", "Pizza", "Fischstäbchen", "Spinat (TK)", "Erbsen (TK)"],
    "drogerie": ["Zahnpasta", "Zahnbürste", "Deo", "Rasierer", "Sonnencreme", "Taschentücher", "Wattepads", "Pflaster", "Tampons", "Binden"],
    "haushalt": ["Toilettenpapier", "Küchenrolle", "Müllbeutel", "Spülmaschinentabs", "Schwämme", "Alufolie", "Frischhaltefolie", "Backpapier", "Batterien", "Glühbirne", "Kerzen", "Gefrierbeutel"],
    "baby": ["Windeln", "Feuchttücher"],
    "tier": ["Katzenfutter", "Hundefutter", "Katzenstreu"],
    "sonstiges": ["Blumen", "Geschenk"],
}
skip = {"Suhi-Reis"}

def norm(s):
    s = s.lower().replace("ß", "ss")
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").strip()

seen = set()
out_products = []

def add(p, cid, common):
    p = p.strip()
    if not p or p in skip or norm(p) in seen:
        return
    seen.add(norm(p))
    # dritter Wert 1: Alltagsprodukt, wird bei gleich guten Treffern zuerst vorgeschlagen
    out_products.append([p, cid, 1 if common else 0])

def split(text):
    return [x.strip() for x in text.replace("\n", " ").split(",") if x.strip()]

# Reihenfolge der Zuordnung: Alltagsprodukte, dann die Erweiterung, dann die alte Liste.
# Was zuerst kommt, bestimmt die Kategorie. Tiefkühl jeweils zuletzt, damit z. B.
# "Erdbeeren" bei Obst landet.
order = sorted(categories, key=lambda c: c[0] == "tiefkuehl")
for cid, *_ in order:
    for p in extra.get(cid, []):
        add(p, cid, True)
for cid, *_ in order:
    for p in split(MORE.get(cid, "")):
        add(p, cid, False)
for cid, _name, _name_en, _emoji, oldtitle in order:
    for p in old.get(oldtitle, []) if oldtitle else []:
        add(p, cid, False)

# Englischer Katalog: gleiche Reihenfolge und Kategorien, Doppelte nach Übersetzung entfernt
english = {}
for line in (root / "scripts/catalog_en.tsv").read_text(encoding="utf-8").splitlines():
    if "\t" in line:
        de, en = line.split("\t", 1)
        english[de.strip()] = en.strip()
seen_en = set()
out_en = []
missing = []
for name, cid, common in out_products:
    en = english.get(name)
    if not en:
        missing.append(name)
        continue
    if norm(en) in seen_en:
        continue
    seen_en.add(norm(en))
    out_en.append([en, cid, common])

data = {
    "categories": [{"id": c[0], "name": c[1], "name_en": c[2], "emoji": c[3]} for c in categories],
    "products": out_products,
    "products_en": out_en,
}
(root / "src/domain/catalog.json").write_text(json.dumps(data, ensure_ascii=False, indent=0), encoding="utf-8")
print(len(out_products), "Produkte,", len(out_en), "auf Englisch")
if missing:
    print("Ohne englischen Namen (in scripts/catalog_en.tsv ergänzen):", ", ".join(missing))
