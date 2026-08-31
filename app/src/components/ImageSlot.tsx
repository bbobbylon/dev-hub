/**
 * The stand-in for artwork that hasn't been supplied yet — the prototype's
 * `<image-slot>`. Pass `src` once a real asset exists and the placeholder is
 * replaced by the image; the `.washed` treatment is the Organic house style for
 * photography, so it sits back into the warm ground.
 */
export function ImageSlot({
  src,
  alt = '',
  placeholder = 'Image goes here',
}: {
  src?: string
  alt?: string
  placeholder?: string
}) {
  if (src) {
    return (
      <img
        className="washed"
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
        background: 'var(--color-neutral-800)',
        border: '2px dashed var(--color-neutral-600)',
        color: 'var(--color-neutral-400)',
        fontSize: 13,
      }}
    >
      {placeholder}
    </div>
  )
}
