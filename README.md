# Nexora

A Nexora egy modern full-stack közösségi rendszer prototípus, amely egy
valódi, éles környezetben is alkalmazható architektúrát és fejlesztési szemléletet mutat be.

A projekt célja:
- professzionális backend architektúra kialakítása **NestJS**-sel,
- hatékony adatkezelés **MongoDB**-vel,
- modern frontend felület **React** segítségével,
- és egy könnyen telepíthető fejlesztői környezet biztosítása **Docker**-rel.

---

## 🚀 Fő funkciók 

### 🔐 Felhasználókezelés és bejelentkezés
- Regisztráció és bejelentkezés
- JWT alapú access + refresh token rendszer
- Szerepkör alapú jogosultságkezelés
- Biztonságos jelszókezelés
- Session és token érvényesség ellenőrzés

### 🏰 Klán rendszer
- Klán létrehozása, elhagyása
- Tagok meghívása klánba
- Meghívások elfogadása / elutasítása
- Tagok eltávolítása klánból
- Szerepkörök: tulajdonos, admin, tag
- Klántagok listázása és keresése

### 📰 Klán faliújság
- Klánhoz kötött üzenőfal
- Bejegyzések írása és megjelenítése
- Saját bejegyzések törlése
- Moderációs jogosultságok adminoknak

### 🏆 Ranglista és Kupa szimuláció

A rendszer tartalmaz egy egyszerű, de jól bővíthető kupa és ranglista modult,
amely szimulált mérkőzéseken keresztül frissíti a felhasználók állását.

#### Funkciók
- Minden felhasználónak van kupa (score) értéke
- A rendszer képes két létező játékost véletlenszerűen összepárosítani
- A szimuláció eldönti:
    - ki nyer
    - ki veszít

#### Beállítások
- Győzelemért járó kupa mennyisége konfigurálható
- Vereség esetén elveszített kupa mennyisége konfigurálható
- Szimuláció manuálisan és automatikusan is futtatható

### 🧬 Migráció és tesztadat generálás
- Automatikus adatfeltöltés indításkor
- Tesztfelhasználók generálása
- Több klán létrehozása
- Felhasználók szétosztása klánokba
- Klán nélküli felhasználók generálása teszteléshez

### 🧭 Felhasználó keresés és meghívás
- Klánon kívüli felhasználók keresése
- Meghívók küldése
- Meghívási állapot kezelése

---

## 🖥 Frontend (React)

### Képernyők
- Bejelentkezés / Regisztráció
- Főoldal
- Adatváltoztatás
- Klán keresés, Jelentezés küldése
- Játék
- Raglista
- Klán
  - Faliújság
  - Faliújságra írás
  - Klán elhagyás
  - Klán admin felület
    - Tagok hívása
    - Tagok kirúgása
    - Jogosultság kiosztás

### Célok
- Modern, letisztult felület
- Reszponzív megjelenés
- Kliensoldali navigáció
- Globális állapotkezelés
- Token-alapú API kommunikáció



---

## 🧱 Technikai architektúra

### Backend
- NestJS moduláris architektúra
- Controller / Service / Repository minták
- DTO validáció
- Egységes hibakezelés
- Naplózás
- Környezetfüggő konfiguráció

### Adatbázis
- Optimalizált indexek
- Aggregációk statisztikákhoz
- Tranzakcióbiztos műveletek
- Konzisztens adatmodell

### Infrastruktúra
- Docker környezet
- Backend konténer
- Frontend konténer
- MongoDB konténer
- (később opcionálisan Redis)

Indítás egy paranccsal:
```bash
docker-compose up
