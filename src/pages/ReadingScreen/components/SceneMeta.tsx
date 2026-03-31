import styles from '../ReadingScreen.module.css';

type SceneMetaProps = {
  place: string;
  characters: string[];
};

export default function SceneMeta({ place, characters }: SceneMetaProps) {
  const showPlace = place !== 'unknown';
  const showCharacters = characters.length > 0;

  if (!showPlace && !showCharacters) {
    return null;
  }

  return (
    <div className={styles.sceneInfo}>
      {showPlace && <span className={styles.scenePlace}>{place}</span>}
      {showPlace && showCharacters && (
        <span className={styles.sceneDot}>·</span>
      )}
      {showCharacters && (
        <span className={styles.sceneCharacters}>{characters.join(', ')}</span>
      )}
    </div>
  );
}
