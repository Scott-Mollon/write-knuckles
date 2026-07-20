import GettingStarted from './sections/GettingStarted'
import CreatingATale from './sections/CreatingATale'
import TaleEditorOverview from './sections/TaleEditorOverview'
import TheRack from './sections/TheRack'
import WritingEditor from './sections/WritingEditor'
import ComicScriptWriting from './sections/ComicScriptWriting'
import ImagesInScenes from './sections/ImagesInScenes'
import Proofreading from './sections/Proofreading'
import Inspector from './sections/Inspector'
import StoryBoard from './sections/StoryBoard'
import BeatSheets from './sections/BeatSheets'
import ResearchDesk from './sections/ResearchDesk'
import SearchReplace from './sections/SearchReplace'
import Trash from './sections/Trash'
import TaleSettings from './sections/TaleSettings'
import CompileExport from './sections/CompileExport'
import AccountProfile from './sections/AccountProfile'
import FeatureRequests from './sections/FeatureRequests'

/** Ordered Help TOC and section components. */
export const HELP_TOPICS = [
  { id: 'getting-started', title: 'Getting started', Component: GettingStarted },
  { id: 'creating-a-tale', title: 'Creating a tale', Component: CreatingATale },
  { id: 'tale-editor', title: 'Tale editor overview', Component: TaleEditorOverview },
  { id: 'the-rack', title: 'The Rack', Component: TheRack },
  { id: 'writing-editor', title: 'Writing and the editor', Component: WritingEditor },
  { id: 'comic-scripts', title: 'Comic script writing', Component: ComicScriptWriting },
  { id: 'scene-images', title: 'Images in scenes', Component: ImagesInScenes },
  { id: 'proofreading', title: 'Proofreading', Component: Proofreading },
  { id: 'inspector', title: 'Inspector', Component: Inspector },
  { id: 'story-board', title: 'Story Board', Component: StoryBoard },
  { id: 'beat-sheets', title: 'Beat Sheets', Component: BeatSheets },
  { id: 'research', title: 'Research Desk', Component: ResearchDesk },
  { id: 'search-replace', title: 'Search and replace', Component: SearchReplace },
  { id: 'trash', title: 'Trash', Component: Trash },
  { id: 'tale-settings', title: 'Tale settings', Component: TaleSettings },
  { id: 'compile-export', title: 'Compile and export', Component: CompileExport },
  { id: 'account-profile', title: 'Account and profile', Component: AccountProfile },
  { id: 'feature-requests', title: 'Feature Requests', Component: FeatureRequests },
]
