# Nexora

A Nexora egy modern full-stack közösségi rendszer prototípus, amely egy
valódi, éles környezetben is alkalmazható architektúrát és fejlesztési szemléletet mutat be.

A projekt célja:
- professzionális backend architektúra kialakítása **NestJS**-sel,
- hatékony adatkezelés **MongoDB**-vel,
- modern frontend felület **React** segítségével,
- és egy könnyen telepíthető fejlesztői környezet biztosítása **Docker**-rel.

---

## ▶️ Futtatás (Docker)

```bash
docker compose up -d --build
```

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

### 🔍 Klán kereső
- A felhasználók böngészhetnek és kereshetnek a rendszerben elérhető klánok között
- Meghívási (csatlakozási) kérelem küldése klánok felé
- A csatlakozás a kérelem elfogadásakor történik

---

## 🖥 Frontend (React)

### Képernyők
- Bejelentkezés / Regisztráció
- Főoldal
- Adatváltoztatás
- Klán keresés, Jelentezés küldése
- Felhasználó keresése, Klán meghívó küldése
- Klán
  - Faliújság
  - Faliújságra írás
  - Klán elhagyás
  - Klán admin felület
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

---

## 🧭 Oldaltérkép

### /login
**Cél:** Bejelentkezés a rendszerbe (JWT token szerzés)  
**Funkciók:**
- Email/jelszó megadása
- Validáció + hibaüzenetek (i18n)
- Sikeres login után redirect: `/`
  **Állapotok:** loading, hibás jelszó, szerver hiba  
  **API:** `POST /auth/login`, utána `GET /auth/me`

### /
**Cél:** Dashboard / kezdő áttekintés  
**Funkciók:**
- Rövid kártyák (users count, clans count) *(ha még nincs, “coming soon”)*  
  **API:** pl. `GET /stats/summary` *(később)*

### /settings
**Cél:** Saját profil + nyelv beállítás  
**Funkciók:**
- Profil módosítás
- Nyelvváltás (hu/en)
  **API:** `PATCH /users/me`

### /users
**Cél:** Felhasználók listázása, szűrés, kiválasztás  
**Funkciók:**
- Paginated lista (limit, rendezés, min/max rank)
- Kiválasztott user részletek panel
- Klán meghívó küldése
- 
### /clan
**Cél:** Saját klán kezelése / klán létrehozása 
**Funkciók:**
- Taglista, szerepek
- Klán elhagyása
- Admin akciók
- Klán meghívó kezelő

### /clans
**Cél:** Klán kereső
**Funkciók:**
- Részletek megjelenítése
- Klán jelentkezés küldése

### /clan/join
**Cél:** Klán meghívó kezelő 
**Funkciók:**
- Klánba jelentkezők listája, elfogadás elutasítás ban
- Lista a felhasználókról akinek meghívó lett küldve, visszavonás

### /clan/news
**Cél:** Klánhírek megjelenítése
**Funkciók:**
- Klán hír létrehozása
- Joggal rendelkező felhasználók törölhetnek hírt

---

## 🛣️ Roadmap (később)
- Clan join/invite lejárat (TTL) + értesítések
- Játék szimulálás. 2 játékos összesorsolása
- Barát rendszer
- Üzenetváltás két felhasználó között
- Rendszer üzenet megjelenítés
