export class SexeBiologique{
    public static readonly FEMME = 'Femme';
    public static readonly HOMME = 'Homme';

    public static getSexeBiologique(sexe: string) {
        switch (sexe) {
            case 'Femme':
                return SexeBiologique.FEMME;
            case 'Homme':
                return SexeBiologique.HOMME;
            default:
                throw new Error(`Invalid color: ${sexe}`);
        }
    }
}