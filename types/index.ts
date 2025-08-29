/**
 * Main type definitions export for Next.js 15.5.0 upgrade
 */

// Export all animation types
export * from './animations'

// Export comprehensive animation interfaces
export * from './animation-interfaces'

// Export all component types
export * from './components'

// Export all global types
export * from './global'

// Export all hook types
export * from './hooks'

// Export all Next.js specific types
export * from './next'

// Export Next.js 15.5.0 enhanced types
export * from './nextjs15'

// Export all performance types
export * from './performance'

// Re-export commonly used React types
export type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  ElementType,
  ForwardRefExoticComponent,
  HTMLAttributes,
  PropsWithChildren,
  PropsWithoutRef,
  ReactElement,
  ReactNode,
  RefAttributes,
  RefCallback,
  RefObject,
} from 'react'

// Re-export commonly used Next.js types
export type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
  NextPage,
  NextPageContext,
  PreviewData,
} from 'next'

// Re-export Metadata types
export type {
  Metadata,
  ResolvingMetadata,
  Viewport,
  ResolvingViewport,
} from 'next'