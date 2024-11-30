import supercluster from "supercluster";
import Supercluster, { AnyProps, PointFeature } from "supercluster";
import ClusterMarker from "./ClusterMarker";
import React, { cloneElement, FC, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ClustererProps, Point } from "./types";

type TPointMap = Record<string, PointFeature<ReactElement>>;

export const Cluster: FC<ClustererProps> = (props) => {
  const {
    clusterStyleFunction,
    clusterRenderFunction,
    latLngToPixel,
    pixelToLatLng,
    mapState,
    className,
    clusterMarkerRadius = 40,
    maxZoom = 16,
    minZoom = 0,
    minPoints = 2,
    children,
    onClick,
    superclusterRef,
  } = props;

  const maxClusterZoom: number = useMemo(() => {
    if (maxZoom >= 0) return maxZoom;
    return 16;
  }, [maxZoom]);

  const minClusterZoom: number = useMemo(() => {
    if (maxClusterZoom < minZoom) {
      return maxClusterZoom;
    }

    if (minZoom <= 16 && minZoom >= 0) {
      return minZoom;
    }

    return 0;
  }, [minZoom, maxClusterZoom]);

  const [state, setState] = useState<{ pointsMap?: TPointMap; index?: Supercluster }>({});

  const generatePointsMap = useCallback(
    (children: ReactNode) => {
      const childrenArray = Array.isArray(children) ? children : [children];
      const pointsMap: TPointMap = {};

      childrenArray.forEach((child) => {
        if (!child) return;
        const { key } = child;
        if (!key) {
          throw new Error("Markers must have a key property");
        }
        if (!child.props.anchor) {
          throw new Error("Markers must have an anchor property");
        }
        pointsMap[key] = {
          properties: cloneElement(child, {
            latLngToPixel,
            pixelToLatLng,
          }),
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: child.props.anchor,
          },
          id: key,
        };
      });

      return pointsMap;
    },
    [latLngToPixel, pixelToLatLng],
  );

  const loadPoints = useCallback(
    (pointsMap: TPointMap) => {
      const index = new supercluster({
        radius: clusterMarkerRadius || 40,
        maxZoom: maxClusterZoom,
        minZoom: minClusterZoom,
        minPoints,
      });
      index.load(Object.values(pointsMap));
      return index;
    },
    [clusterMarkerRadius, maxClusterZoom, minPoints, minClusterZoom],
  );

  const rebuildData = useCallback(() => {
    const pointsMap = generatePointsMap(children);
    const index = loadPoints(pointsMap);
    if (superclusterRef) superclusterRef.current = index;

    setState({
      pointsMap,
      index,
    });
  }, [children, generatePointsMap, loadPoints]);

  useEffect(() => {
    rebuildData();
  }, [rebuildData]); // props was removed as a dependency, hence on prop change, data might not be rebuilt

  const ne = mapState?.bounds.ne ?? [0, 0];
  const sw = mapState?.bounds.sw ?? [0, 0];
  const [westLng, southLat, eastLng, northLat] = [sw[0], sw[1], ne[0], ne[1]];

  const markersAndClusters: Array<Supercluster.ClusterFeature<AnyProps> | Supercluster.PointFeature<AnyProps>> =
    state.index
      ? state.index.getClusters(
          [westLng, southLat, eastLng, northLat],
          Math.floor(mapState?.zoom ?? 0),
        )
      : [];

  const displayElements = markersAndClusters.map((markerOrCluster) => {
    let displayElement;
    const isCluster = markerOrCluster.properties?.cluster;
    const pixelOffset = latLngToPixel?.(markerOrCluster.geometry.coordinates as Point);

    const onClusterClick = () =>
      onClick?.({
        ...markerOrCluster.geometry,
        ...markerOrCluster.properties,
      });

    if (isCluster) {
      const clusterElementKey = markerOrCluster.geometry.coordinates.toString();
      displayElement = (
        <ClusterMarker
          key={clusterElementKey}
          clusterId={markerOrCluster.id as number} // Force number type
          count={markerOrCluster.properties.point_count}
          pixelOffset={pixelOffset}
          clusterStyleFunction={clusterStyleFunction}
          clusterRenderFunction={clusterRenderFunction}
          clusterMarkerRadius={clusterMarkerRadius}
          onClusterClick={onClusterClick}
        />
      );
    } else {
      displayElement = cloneElement(state.pointsMap![markerOrCluster.id!].properties, {
        left: pixelOffset?.[0],
        top: pixelOffset?.[1],
      });
    }
    return displayElement;
  });

  return (
    <div
      className={className}
      style={{ position: "absolute", height: mapState?.height, width: mapState?.width }}
    >
      {displayElements}
    </div>
  );
};
