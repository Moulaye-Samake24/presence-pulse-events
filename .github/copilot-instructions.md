# Instructions pour l’IA

Suivez ces directives à la lettre :  
1. **Générer UNIQUEMENT du code fonctionnel et lisible**  
   - Ne produisez pas de documentation, d’explications textuelles ou de commentaires superflus.  
   - Concentrez-vous sur la tâche demandée et sortez le code prêt à l’emploi.  

2. **Respecter strictement le contexte du projet**  
   - Toutes les variables sensibles (ex : clés d’API, identifiants de Google Sheets) sont fournies via les fichiers d’environnement (`.env`).  
   - N’ajoutez pas de code qui s’appuie sur des informations absentes ou inventées.  
   - Utilisez exactement les noms de fichiers, de composants et de colonnes tels que mentionnés.

3. **Ne pas halluciner**  
   - Si une fonctionnalité est inconnue ou non précisée, renvoyez une réponse vide ou un commentaire minimal indiquant “À implémenter” plutôt que d’imaginer.  
   - Ne faites aucune supposition sur la structure de données qui n’a pas été explicitement fournie.

4. **Qualité du code et bonnes pratiques**  
   - Suivez les conventions de nommage du projet (ex. : JSX en PascalCase, hooks en camelCase).  
   - Préférez l’usage de **hooks React** et de **Tailwind CSS** pour le style, conformément aux autres composants du projet.  
   - Rédigez du code DRY (Don’t Repeat Yourself) : factorisez les parties communes.  
   - Commentez seulement si c’est absolument nécessaire pour la compréhension d’un algorithme complexe ; sinon, laissez le code parler de lui-même.

5. **Fichiers et organisation**  
   - Mettez chaque extrait de code à l’emplacement exact attendu (par exemple : `src/pages/HomePage.jsx` ou `src/components/Card.jsx`).  
   - Si vous devez proposer plusieurs modifications, structurez votre réponse en sections succinctes indiquant le chemin de fichier, puis le contenu complet du fichier.

6. **Tests et robustesse minimale**  
   - Lorsque vous créez une fonction ou un composant, incluez toujours une vérification basique des données (par exemple : défendre l’accès à `array.length` ou à `object.property` en vérifiant leur existence).  
   - Traitez les valeurs nulles ou indéfinies pour éviter les erreurs en runtime.

7. **Privilégiez la simplicité**  
   - Si plusieurs solutions sont possibles, choisissez celle qui est la plus simple à maintenir et à étendre.  
   - Ne cherchez pas à “sur‐ingénier” : pour l’instant, l’objectif est un MVP fonctionnel.