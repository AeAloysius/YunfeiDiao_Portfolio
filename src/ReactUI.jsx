import CameraController from "./reactComponents/CameraController.jsx";
import SocialModal from "./reactComponents/SocialModal";
import EmailModal from "./reactComponents/EmailModal";
import ProjectModal from "./reactComponents/ProjectModal";

export default function ReactUI() {
    return(
    <>
    <p className="controls-message">Tap/Click around to move, try to step on white spots</p>
    <CameraController />
    <SocialModal />
    <EmailModal />
    <ProjectModal />
    </>
    );
}
