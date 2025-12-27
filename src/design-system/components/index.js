/**
 * Design System Components Entry Point
 * This file will export enhanced components as they are created
 */

// Enhanced components
export { Button } from './Button.jsx';
export { Card, CardHeader, CardTitle, CardDescription, CardActions, CardContent, CardFooter } from './Card.jsx';
export { Input, Textarea, Select, InputWrapper } from './Input.jsx';
export { 
  Table, 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableCell, 
  TableHeaderCell 
} from './Table.jsx';
export {
  Loading,
  LoadingOverlay,
  Spinner,
  Dots,
  Pulse,
  Skeleton,
  ProgressBar,
} from './Loading.jsx';

export const DESIGN_SYSTEM_VERSION = '1.0.0';

// Component registry for tracking implemented components
export const componentRegistry = {
  button: { implemented: true, version: '1.0.0' },
  card: { implemented: true, version: '1.0.0' },
  input: { implemented: true, version: '1.0.0' },
  table: { implemented: true, version: '1.0.0' },
  loading: { implemented: true, version: '1.0.0' },
};