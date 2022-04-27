export interface SelectItem {
  id: string;
  name: string;
  isHighlightItem?: boolean;
  belongingAttribute?: {
    name: string;
    color: string;
  };
}
