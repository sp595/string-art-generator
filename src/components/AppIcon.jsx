import React from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  Compass,
  Crop,
  Download,
  FileText,
  FolderOpen,
  Hand,
  Hammer,
  Info,
  Lightbulb,
  MoveRight,
  Palette,
  Pause,
  Play,
  Save,
  Scissors,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  Trash2,
  Upload,
  WandSparkles,
  X,
  Zap
} from 'lucide-react'

const ICON_MAP = {
  check: CheckCircle2,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  alert: CircleAlert,
  compass: Compass,
  crop: Crop,
  download: Download,
  fileText: FileText,
  folderOpen: FolderOpen,
  hand: Hand,
  hammer: Hammer,
  info: Info,
  lightbulb: Lightbulb,
  moveRight: MoveRight,
  palette: Palette,
  pause: Pause,
  play: Play,
  save: Save,
  scissors: Scissors,
  shield: Shield,
  sliders: SlidersHorizontal,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  trash2: Trash2,
  upload: Upload,
  wand: WandSparkles,
  close: X,
  zap: Zap
}

function AppIcon({ name, size = 18, strokeWidth = 2, className }) {
  const IconComponent = ICON_MAP[name]
  if (!IconComponent) return null

  return <IconComponent size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />
}

export default AppIcon
