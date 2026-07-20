# Étude antivirus T-34A — 20 juillet 2026

> **Support de décision — non normatif.** Cette étude prépare l’arbitrage du port
> `malwareScanner`. Elle n’autorise ni installation, ni activation, ni traitement de données
> réelles.

## Conclusion proposée

Pour la preuve T-34A, utiliser **ClamAV `clamd` dans un conteneur isolé**, appelé par le backend via
le port interne `malwareScanner`. Le backend transmet un flux borné avec la commande `INSTREAM` et
traduit la réponse dans un vocabulaire stable. Aucun port ClamAV n’est publié sur Internet.

Cette option est recommandée pour valider le contrat, les états et les erreurs sans transmettre les
fichiers à un tiers. Elle ne constitue pas encore un choix de production : la capacité de la machine,
les formats réellement analysables, les mises à jour de signatures et la qualité opérationnelle
doivent être prouvées en préproduction. Une offre managée pourra remplacer ClamAV derrière le même
port sans modifier le domaine.

## Architecture proposée

```text
navigateur → backend → quarantaine privée → malwareScanner → clamd isolé
                                      ↓
                           verdict normalisé et audit
```

- le frontend ne contacte jamais le scanner ;
- le backend contrôle d’abord taille, type réel et empreinte ;
- le fichier reste privé et non exploitable pendant l’analyse ;
- `clamd` reçoit le contenu par `INSTREAM`, sans chemin métier ni droit sur le stockage principal ;
- le réseau ou socket du scanner reste local au déploiement et inaccessible publiquement ;
- les journaux excluent contenu, nom original, secret, chemin, hash sensible et réponse brute ;
- l’antivirus ne remplace ni le contrôle de type, ni l’isolation des parseurs, ni la prudence envers
  tout contenu externe.

## Contrat de verdict

| Verdict interne | Signification | Suite autorisée |
|---|---|---|
| `sain` | analyse terminée sans détection | passage à l’étape asynchrone suivante |
| `infecte` | détection positive | maintien en quarantaine et refus d’exposition |
| `non_analysable` | format, protection ou structure non inspectable de manière probante | maintien en quarantaine |
| `erreur` | erreur technique pour ce fichier | nouvelle tentative bornée, puis intervention |
| `indisponible` | scanner ou signatures non prêts | aucune validation ; reprise ultérieure |

Seul `sain` ouvre la suite du traitement. Le nom de signature ClamAV et les diagnostics bruts restent
des détails d’adaptateur non exposés au navigateur.

## Configuration et exploitation

- utiliser l’image officielle et une série fonctionnelle évaluée, jamais `latest` ou `unstable` ;
- figer l’image réellement validée par digest dans l’environnement de recette ;
- persister la base de signatures et contrôler sa fraîcheur avant de déclarer le service prêt ;
- régler `StreamMaxLength` au-dessus de la limite applicative de 20 Mo, avec une marge technique
  explicite, tout en conservant la limite métier à 20 Mo dans le backend ;
- appliquer délais, concurrence et nombre de tentatives bornés ;
- prévoir des contrôles `PING`, version du moteur, âge des signatures et métriques de files ;
- réserver au minimum la capacité recommandée par l’éditeur : 3 Gio de RAM, 4 Gio préférés, plus la
  marge des autres services. Le rechargement concurrent des signatures peut provoquer un pic ;
- ne pas installer ClamAV sur le VPS actuel avant mesure de sa RAM disponible et test du pic de
  rechargement sous la charge orIAna.

## Formats et limites connues

ClamAV documente l’inspection des archives, des formats Office OLE2/OOXML, de PDF, RTF, HTML, JPEG,
PNG, TIFF et RIFF. Pour Office, RTF et PDF, le moteur extrait notamment les objets embarqués sans
décoder tout le texte : l’OCR ou l’analyse sémantique restent donc des traitements distincts.

La liste officielle des types spécialisés ne mentionne pas explicitement HEIC, WebM ou MP4. Cela ne
signifie pas qu’aucune signature générique ne peut les détecter, mais empêche de présumer une analyse
complète. Ces formats ne pourront produire `sain` dans orIAna qu’après une recette représentative ;
sinon ils produiront `non_analysable` et resteront en quarantaine. Les variantes chiffrées,
corrompues, tronquées ou inconnues suivent la même règle.

## Preuve de préproduction exigée

Le jeu de test reste fictif et isolé. Il couvre au minimum :

1. EICAR, uniquement dans l’environnement de recette isolé, avec verdict `infecte` ;
2. corpus sain PDF, XLS, XLSX, JPEG, PNG, WEBP, HEIC, WebM et MP4 ;
3. PDF et Office contenant des objets embarqués ;
4. fichiers mal nommés, type déclaré falsifié, tronqués, corrompus ou protégés par mot de passe ;
5. archive compressée, archive récursive et bombe de décompression contrôlée ;
6. fichier de 20 Mo accepté et dépassement refusé avant le scanner ;
7. dépassement de délai, scanner arrêté et signatures trop anciennes ;
8. reprise idempotente sans double validation ni sortie de quarantaine ;
9. absence de port public, de contenu sensible dans les logs et de droit métier du conteneur ;
10. charge simultanée, mise à jour des signatures et consommation maximale de RAM.

## Conditions avant production

- résultat satisfaisant du POC pour chaque format autorisé ;
- capacité réservée et surveillance du scanner validées ;
- procédure de mise à jour, retour arrière et indisponibilité documentée ;
- politique de faux positif, incident et réanalyse validée ;
- comparaison datée avec une offre managée sur localisation, sous-traitants, confidentialité, coût,
  SLA, rétention et suppression ;
- recette de restauration confirmant que les fichiers restaurés repassent par une politique de
  quarantaine cohérente.

## Sources officielles consultées

- [Protocole `clamd` et commande `INSTREAM`](https://docs.clamav.net/manual/Usage/ClamdProtocol.html)
- [Images Docker officielles et ressources recommandées](https://docs.clamav.net/manual/Installing/Docker.html)
- [Formats pris en charge par libclamav](https://docs.clamav.net/manual/Development/libclamav.html)
- [Types de fichiers reconnus par ClamAV](https://docs.clamav.net/appendix/FileTypes.html)
- [Reconnaissance des types par signature magique](https://docs.clamav.net/manual/Signatures/FileTypeMagic.html)
