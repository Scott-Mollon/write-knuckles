import { useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { useSignedStorageUrl } from '../../hooks/useSignedStorageUrl'
import { useSceneImageResize } from '../../hooks/useSceneImageResize'

const SceneImageNodeView = ({ node, selected, updateAttributes }) => {
  const { sourceType, storagePath, src, alt, display, width } = node.attrs
  const wrapperRef = useRef(null)
  const frameRef = useRef(null)
  const displayMode = display === 'inline' ? 'block' : display || 'block'
  const isFloat = displayMode === 'float-left' || displayMode === 'float-right'
  const canResize = displayMode !== 'full'
  const resizeTargetRef = isFloat ? wrapperRef : frameRef
  const { data: signedUrl, isLoading, isError } = useSignedStorageUrl(
    sourceType === 'upload' ? storagePath : null
  )

  const imageUrl = sourceType === 'url' ? src : signedUrl
  const widthStyle = width ? { width: `${width}%`, maxWidth: `${width}%` } : undefined
  const handleResizeStart = useSceneImageResize({
    enabled: canResize,
    targetRef: resizeTargetRef,
    updateAttributes,
  })

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      as="div"
      className={`scene-image scene-image--${displayMode}${selected ? ' scene-image--selected' : ''}${width ? ' scene-image--sized' : ''}`}
      style={isFloat ? widthStyle : undefined}
      data-drag-handle
    >
      <div
        ref={frameRef}
        className="scene-image__frame"
        style={!isFloat ? widthStyle : undefined}
      >
        {!imageUrl && sourceType === 'upload' && isLoading && (
          <div className="scene-image__placeholder" role="status">
            Loading image…
          </div>
        )}

        {!imageUrl && (sourceType === 'url' || isError) && (
          <div className="scene-image__placeholder scene-image__placeholder--error" role="img" aria-label="Image unavailable">
            Image unavailable
          </div>
        )}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={alt || ''}
            className="scene-image__img"
            referrerPolicy={sourceType === 'url' ? 'no-referrer' : undefined}
            draggable={false}
          />
        )}

        {selected && canResize && imageUrl && (
          <span
            role="presentation"
            aria-hidden="true"
            className="scene-image__resize-handle"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default SceneImageNodeView
