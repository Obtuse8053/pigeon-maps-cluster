import { CSSProperties, JSX, MutableRefObject, ReactElement, ReactNode } from "react";
import supercluster, { AnyProps, ClusterProperties } from "supercluster";
import { Point as GeoJSONPoint } from "geojson";
export type Point = [number, number];

export interface MapState {
  bounds: Bounds;
  zoom: number;
  center: Point;
  width: number;
  height: number;
}

export interface Bounds {
  ne: [number, number];
  sw: [number, number];
}

export declare type TileComponent = (props: TileComponentProps) => JSX.Element;
export interface TileComponentProps {
  tile: Tile;
  tileLoaded: () => void;
}
export interface Tile {
  key: string;
  url: string;
  srcSet: string;
  left: number;
  top: number;
  width: number;
  height: number;
  active: boolean;
}

export interface MapProps {
  center?: Point;
  defaultCenter?: Point;
  zoom?: number;
  defaultZoom?: number;
  width?: number;
  defaultWidth?: number;
  height?: number;
  defaultHeight?: number;
  provider?: (x: number, y: number, z: number, dpr?: number) => string;
  dprs?: number[];
  children?: ReactNode;
  animate?: boolean;
  animateMaxScreens?: number;
  minZoom?: number;
  maxZoom?: number;
  metaWheelZoom?: boolean;
  metaWheelZoomWarning?: string;
  twoFingerDrag?: boolean;
  twoFingerDragWarning?: string;
  warningZIndex?: number;
  attribution?: JSX.Element | false;
  attributionPrefix?: JSX.Element | false;
  zoomSnap?: boolean;
  mouseEvents?: boolean;
  touchEvents?: boolean;
  onClick?: ({
    event,
    latLng,
    pixel,
  }: {
    event: MouseEvent;
    latLng: [number, number];
    pixel: [number, number];
  }) => void;
  onBoundsChanged?: ({
    center,
    zoom,
    bounds,
    initial,
  }: {
    center: [number, number];
    bounds: Bounds;
    zoom: number;
    initial: boolean;
  }) => void;
  onAnimationStart?: () => void;
  onAnimationStop?: () => void;
  limitBounds?: "center" | "edge";
  boxClassname?: string;
  tileComponent?: TileComponent;
}

export type ClusterOnClickProps = GeoJSONPoint & (ClusterProperties | AnyProps);

export interface ClustererProps {
  children: (ReactElement | null)[];
  left?: number;
  top?: number;
  mapProps?: MapProps;
  mapState?: MapState;
  latLngToPixel?: (latLng: Point, center?: Point, zoom?: number) => Point;
  pixelToLatLng?: (pixel: Point, center?: Point, zoom?: number) => Point;
  setCenterZoom?: (center?: Point | null, zoom?: number | null, animationEnded?: boolean) => void;
  className?: string;
  maxZoom?: number;
  minZoom?: number;
  minPoints?: number;
  clusterMarkerRadius?: number;
  clusterStyleFunction?: (
    clusterId: number,
    pointCount: number,
    markerPixelOffset?: [number, number],
  ) => CSSProperties;
  clusterRenderFunction?: (
    clusterId: number,
    pointCount: number,
    markerPixelOffset?: [number, number],
  ) => ReactElement;
  onClick?: (data: ClusterOnClickProps) => void;
  superclusterRef?: MutableRefObject<supercluster | null>;
}

export interface ClusterMarkerProps {
  clusterId: number;
  count: number;
  pixelOffset?: [number, number];
  clusterStyleFunction: ClustererProps["clusterStyleFunction"];
  clusterRenderFunction: ClustererProps["clusterRenderFunction"];
  clusterMarkerRadius: number;
  onClusterClick?: () => void;
}
