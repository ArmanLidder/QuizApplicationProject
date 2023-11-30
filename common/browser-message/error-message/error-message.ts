import { HOST_USERNAME } from '../../names/host-username';

export namespace errorDictionary {
    export const issues = 'les problèmes suivants';
    export const issue = 'le problème suivant';
    export const fileContains = 'Le fichier que vous tenter d\'importer contient '
    export const solution = '\n\n Veuillez corriger cela avant de réessayer. ';
    export const quizDeleted = 'Ce quiz a été supprimé, veuillez choisir un autre.';
    export const quizInvisible = 'Ce quiz est maintenant caché, veuillez choisir un autre.';
    export const quizAlreadyExist = 'Un quiz ayant le même titre existe déjà';
    export const wrongPassword = 'Mot de passe incorrect. Veuillez réessayer!';
    export const charNumError = "Le nom de l'utilisateur doit contenir au moins un caractère!";
    export const organiserNameError = `Le nom de l'utilisateur ne peut pas être ${HOST_USERNAME}!`;
    export const validationCodeError = 'Votre code doit contenir seulement 4 chiffres (ex: 1234)';
    export const roomCodeExpired = 'Le code ne correspond a aucune partie en cours. Veuillez réessayer';
    export const roomLocked = 'La partie est vérouillée. Veuillez réessayer.';
    export const nameEmpty = 'Le nom ne doit pas être vide!';
    export const banMessage = 'Vous avez été banni du lobby et vous ne pouvez plus rentrez.';
    export const nameAlreadyUsed = 'Le nom choisi est déjà utiliser. Veuillez choisir un autre.';
}
