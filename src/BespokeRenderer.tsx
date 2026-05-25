"use client";

import { type ReactNode, useMemo } from "react";
import {
  Renderer,
  type ComponentRenderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";
import type { PersonaConfig } from "./types";
import { buildRegistry, Fallback } from "./registry";

interface BespokeRendererProps {
  config: PersonaConfig;
  spec: Spec | null;
  loading?: boolean;
}

const fallback: ComponentRenderer = ({ element }) => <Fallback type={element.type} />;

export function BespokeRenderer({ config, spec, loading }: BespokeRendererProps): ReactNode {
  const { registry } = useMemo(() => buildRegistry(config), [config]);
  if (!spec) return null;
  return (
    <StateProvider initialState={spec.state ?? {}}>
      <VisibilityProvider>
        <ActionProvider>
          <Renderer spec={spec} registry={registry} fallback={fallback} loading={loading} />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
