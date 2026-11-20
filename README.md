# CargoKalk

Kalkulačka nákladov na prepravu a porovnanie dopravcov. Semestrálny projekt z logistiky vytvorený s pomocou AI (vibe coding).

## Čo aplikácia robí

- vyberiete trasu medzi mestami (vzdialenosť sa odhadne, dá sa prepísať),
- zadáte hmotnosť, počet paliet, typ tovaru a termín,
- aplikácia vyradí dopravcov, ktorí zásielku nezvládnu (nosnosť, palety, chladenie, ADR),
- ostatných zoradí podľa ceny a času a odporučí najvhodnejšieho,
- ukáže rozpis ceny a orientačný čas prepravy podľa pravidiel pre vodičov,
- dopravcov a ich sadzby môžete pridávať, upravovať a mazať,
- údaje sa ukladajú v prehliadači.

Sadzby aj vzdialenosti sú orientačné.

## Spustenie

Potrebný je Node.js 18 alebo novší. Projekt nemá žiadne externé závislosti.

    npm start   # server na http://localhost:3000
    npm test    # testy výpočtov

## Nasadenie na Railway

1. Nahrajte obsah tohto priečinka do koreňa repozitára na GitHube.
2. Railway: New Project → Deploy from GitHub repo → vyberte repozitár.
3. Settings → Networking → Generate Domain. Port nájdete v záznamoch (riadok `CargoKalk listening on port …`).

Vypracoval: Andrii Chyhorka
