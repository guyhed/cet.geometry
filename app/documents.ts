/// <amd-module name='cet.geometry/app/documents'/>


module documents {
  export class DocumentRevision {
    theme: documents.ThemeData;
    documentModel: documents.DocumentModel;
    remark: string;
    goals: string[];
    sourceDocument: documents.DocumentRelation;
    elements: documents.ElementData[];
    questions: documents.QuestionData[];
    title: string;
    documentId: string;
    majorVersion: number;
    majorVersionSpecified: boolean;
    minorVersion: number;
    minorVersionSpecified: boolean;
    language: documents.Language;
    evaluationMode: documents.EvaluationMode;
    hasGoogleDoc: boolean;
    storeMode: documents.StoreMode;
    workflowStep: documents.WorkflowStep;
    workflowStepSpecified: boolean;
    loComponentsVersion: string;
    createdDate: Date;
    createdDateSpecified: boolean;
    createdBy: string;
  }
  export class ThemeData {
    font: documents.FontData;
    backgroundStyle: documents.backgroundStyle;
    name: string;
    questionBackgroundColor: string;
  }
  export class FontData {
    name: string;
    size: string;
    lineHeight: string;
  }
  export class QuestionData {
    elementId: string;
    questionIndex: string;
    itemId: string;
  }
  export class ResourceData {
    priority: number;
    resourceType: documents.ResourceType;
    url: string;
    external: boolean;
  }
  export enum ResourceType {
    image,
    video,
    audio,
    iframe,
    anchor,
  }
  export class ElementData {
    goalExtentions: string[];
    resources: documents.ResourceData[];
    elementId: string;
    parentId: string;
    parentQuestionId: string;
    evaluationParentId: string;
    documentModelName: string;
    evaluationMode: documents.EvaluationMode;
    storeMode: documents.StoreMode;
    storeModeSpecified: boolean;
    normalizedWeight: number;
    normalizedWeightSpecified: boolean;
    majorVersionStamp: string;
  }
  export enum EvaluationMode {
    manual,
    auto,
    none,
    ignore,
  }
  export enum StoreMode {
    full,
    partial,
    none,
  }
  export class DocumentRelation {
    documentId: string;
    language: documents.Language;
    majorVersion: number;
    minorVersion: number;
    relationType: documents.DocumentRelationType;
  }
  export enum Language {
    he,
    ar,
    en,
    vi,
    zh,
  }
  export enum DocumentRelationType {
    localization,
    copy,
  }
  export class snackbarMessages {
    localId: string;
  }
  export class sideMenu {
    title: string;
    localId: string;
    showUserDetails: boolean;
    showSchoolPicker: boolean;
    showViewAsTeacher: boolean;
    showViewAsStudent: boolean;
    showDisconnectButton: boolean;
    hideLogo: boolean;
  }
  export class Tab {
    mountId: string;
    name: string;
    title: string;
    cssClass: string;
    action: string;
    value: string;
  }
  export class Tabs {
    tab: documents.Tab[];
    localId: string;
  }
  export class TabPanel {
    localId: string;
  }
  export class richTextEditor {
    startupHtml: string;
    localId: string;
    presetName: string;
  }
  export class questionnaire {
    e_page: documents.page[];
    extended: documents.extendedElement;
    localId: string;
    pageTransition: documents.pageTransitionType;
  }
  export class page {
    e_videoZone: documents.videoZone;
    e_gameZone: documents.gameZone;
    e_applicationZone: documents.applicationZone;
    e_question: documents.question[];
    e_interactiveContent: documents.question[];
    e_staticContent: documents.staticContent[];
    e_verticalScrollZone: documents.baseZone[];
    extended: documents.extendedElement;
    layoutId: string;
    pageTitle: string;
    localId: string;
  }
  export class videoZone {
    questions: documents.videoQuestion[];
    instructions: string;
    instructionsBackgroundColor: string;
    localId: string;
    videoId: string;
    videoStart: number;
    videoEnd: number;
  }
  export class videoQuestion {
    timePosition: string;
    title: string;
    layout: documents.videoQuestionLayout;
    width: string;
    height: string;
    top: string;
    left: string;
    opacity: string;
  }
  export enum videoQuestionLayout {
    floating,
    dockedTop,
    dockedRight,
    dockedBottom,
    dockedLeft,
  }
  export class gameZone {
    questions: documents.videoQuestion[];
    instructions: string;
    instructionsBackgroundColor: string;
    localId: string;
    zoneId: string;
  }
  export class applicationZone {
    questions: documents.videoQuestion[];
    instructions: string;
    instructionsBackgroundColor: string;
    e_application: documents.application;
    localId: string;
  }
  export class application {
    appOptions: documents.appOptions;
    extended: documents.extendedElement;
    localId: string;
    iFrameId: string;
    iframeHeight: string;
    isManual: boolean;
    src: string;
    majorVersionStamp: string;
    gameModeOn: documents.appGameMode;
  }
  export class appOptions {
    preset: string;
  }
  export class extendedElement {
    name: string;
    preset: string;
    description: string;
  }
  export enum appGameMode {
    none,
    free,
    practice,
  }
  export class question {
    backgroundStyle: documents.backgroundStyle;
    instructions: string;
    e_cloze: documents.cloze;
    e_dropdownField: documents.dropdownField;
    e_multiChoice: documents.multiChoice;
    e_singleChoice: documents.multiChoice;
    e_textField: documents.textField;
    e_richTextField: documents.richTextField;
    e_scormField: documents.scormField;
    e_equationEditor: documents.equationEditor;
    e_mathWorksheet: documents.mathWorksheet;
    e_geogebra: documents.geogebra;
    e_application: documents.application;
    e_questionAssistants: documents.questionAssistants;
    e_googleDoc: documents.googleDoc;
    teacherIndicator: string;
    studentIndicator: string;
    extended: documents.extendedElement;
    elementId: string;
    name: string;
    type: documents.templateType;
    typeSpecified: boolean;
    zoneId: string;
    themeClass: string;
    weight: number;
    weightSpecified: boolean;
    bullet: string;
    order: number;
    supportReset: boolean;
    supportRegenerate: boolean;
    supportShowFeedback: boolean;
    supportShowSolution: boolean;
    alwaysShowCheckButton: boolean;
  }
  export class backgroundStyle {
    type: documents.backgroundType;
    color: string;
    imageUrl: string;
    imageLayout: documents.imageLayout;
    imageLayoutSpecified: boolean;
    imageScroll: documents.imageScroll;
    imageScrollSpecified: boolean;
    imageBgColor: string;
    imageOpacity: number;
    imageOpacitySpecified: boolean;
  }
  export enum backgroundType {
    inherit,
    color,
    image,
  }
  export enum imageLayout {
    fit,
    stretch,
    none,
    linkedToRight,
    linkedToLeft,
    tile,
  }
  export enum imageScroll {
    normal,
    fixedScroll,
    parallax,
  }
  export class cloze {
    e_application: documents.application[];
    e_dropdownField: documents.dropdownField[];
    e_multiChoice: documents.multiChoice[];
    e_singleChoice: documents.multiChoice[];
    e_textField: documents.textField[];
    e_equationEditor: documents.equationEditor[];
    e_geoboard: documents.geoboard[];
    e_geogebra: documents.geogebra[];
    e_richTextField: documents.richTextField[];
    e_audioRecorder: documents.audioRecorder[];
    e_snapshotField: documents.snapshotField[];
    extended: documents.extendedElement;
    htmlContent: string;
  }
  export class dropdown {
    emptyOption: documents.dropdownOption;
    option: documents.dropdownOption[];
    localId: string;
    navigationArrows: boolean;
    navigationArrowsSpecified: boolean;
  }
  export class dropdownField extends dropdown {
    correctOptionValue: number;
    shuffle: boolean;
  }
  export class dropdownOption {
    title: string;
    value: string;
    cssClass: string;
    action: string;
    menuTitle: string;
    readonly: boolean;
    readonlySpecified: boolean;
  }
  export class multiChoice {
    e_option: documents.option[];
    extended: documents.extendedElement;
    localId: string;
    layout: documents.mcLayout;
    shuffle: boolean;
  }
  export class option {
    labelHtml: string;
    extended: documents.extendedElement;
    correct: boolean;
  }
  export enum mcLayout {
    vertical,
    horizontal,
  }
  export class textField {
    startupText: string;
    correctAnswer: string[];
    hint: string;
    localId: string;
    noEvaluation: boolean;
    width: string;
    rows: string;
  }
  export class equationEditor {
    key: documents.equationEditorKey[];
    content: documents.equationEditorInitialContent;
    evaluation: documents.equationEditorEvaluation;
    keyboardOffset: documents.offset;
    extended: documents.extendedElement;
    specialStateTexts: documents.equationEditorSpecialStateTexts;
    editableMinWidth: number;
    maxEditableTextLength: number;
    color: string;
    textBetweenRows: string;
    columnDisplay: boolean;
    minRows: number;
    maxRows: number;
    blockOtherKeys: boolean;
    localId: string;
  }
  export class equationEditorKey {
    name: string;
    latex: string;
    text: string;
    keyLatex: string;
    cssClass: string;
    imgSrc: string;
    key: string;
    order: number;
    orderSpecified: boolean;
    hide: boolean;
    hideSpecified: boolean;
    type: documents.equationEditorKeyTypes;
  }
  export enum equationEditorKeyTypes {
    command,
    write,
    key,
    any,
    none,
    addRow,
    removeRow,
    enter,
    undo,
    redo,
  }
  export class equationEditorInitialContent {
    latex: string;
    numberOfRows: number;
  }
  export class equationEditorEvaluation {
    solution: documents.equationEditorContent;
    testValues: documents.equationEditorTestValues;
    tolerance: number;
    type: documents.equationEditorEvaluationType;
    different: boolean;
  }
  export class equationEditorContent {
    row: documents.rowContent[];
    specialState: documents.equationEditorSpecialStates;
    specialStateSpecified: boolean;
  }
  export class rowContent {
    editable: documents.editableContent[];
    index: number;
    indexSpecified: boolean;
  }
  export class editableContent {
    latex: string;
  }
  export enum equationEditorSpecialStates {
    any,
    none,
  }
  export class equationEditorTestValues {
    variableNames: documents.rowContent;
    values: documents.rowContent[];
  }
  export enum equationEditorEvaluationType {
    expression,
    equationAnd,
    equationOr,
    statement,
    triplet,
    tripletSameOp,
    manual,
    none,
  }
  export class offset {
    top: number;
    right: number;
  }
  export class equationEditorSpecialStateTexts {
    any: string;
    none: string;
  }
  export class geoboard {
    segment: documents.geoboardSegment[];
    evaluation: documents.geoboardEvaluation[];
    evaluationConnective: documents.geoboardEvaluationConnective;
    solution: documents.geoboardSegment[];
    gridType: documents.geoboardGridType;
    segmentSize: documents.geoboardSegmentSize;
    gridWidth: number;
    gridHeight: number;
    displayGridLines: boolean;
    localId: string;
    enableDraw: boolean;
    enableMeasure: boolean;
    enableSketch: boolean;
    enableFreemove: boolean;
  }
  export class geoboardSegment {
    firstVertexIndex: number;
    secondVertexIndex: number;
  }
  export class geoboardEvaluation {
    parameter: documents.geoboardEvaluationParameter;
    relation: documents.geoboardEvaluationRelation;
    polygonType: documents.geoboardEvaluationPolygonType;
    polygonTypeSpecified: boolean;
    compareToGiven: boolean;
    compareToGivenSpecified: boolean;
    compareToValue: number;
    compareToValueSpecified: boolean;
    negation: boolean;
    negationSpecified: boolean;
  }
  export enum geoboardEvaluationParameter {
    area,
    perimeter,
    polygonType,
    givenObject,
    length,
    angleSize,
  }
  export enum geoboardEvaluationRelation {
    equal,
    larger,
    smaller,
    largerOrEqual,
    smallerOrEqual,
    congruent,
    similar,
    intersect,
    parallel,
    continuous,
    disjoint,
    contains,
    diagonal,
  }
  export enum geoboardEvaluationPolygonType {
    triangle,
    equilateralTriangle,
    isoscelesTriangle,
    rightTriangle,
    acuteTriangle,
    obtuseTriangle,
    scaleneTriangle,
    quadrilateral,
    square,
    rectangle,
    rhombus,
    kite,
    parallelogram,
    trapezoid,
    pentagon,
    hexagon,
    septagon,
    octagon,
    isocelesTrapezoid,
    rightTrapezoid,
  }
  export enum geoboardEvaluationConnective {
    and,
    or,
  }
  export enum geoboardGridType {
    square,
    triangular,
  }
  export enum geoboardSegmentSize {
    small,
    large,
  }
  export class geogebra {
    width: number;
    height: number;
    allowStyleBar: boolean;
    enableRightClick: boolean;
    enableLabelDrags: boolean;
    allowRescaling: boolean;
    enableShiftDragZoom: boolean;
    errorDialogsActive: boolean;
    showMenubar: boolean;
    showToolbar: boolean;
    showToolbarHelp: boolean;
    showAlgebraInput: boolean;
    showResetIcon: boolean;
    ggbBase64: string;
    ggbFileName: string;
    solutionBase64: string;
    solutionFileName: string;
    autoEvaluation: boolean;
    launchOnClick: boolean;
    localId: string;
  }
  export class richTextField {
    startupHtml: string;
    hint: string;
    localId: string;
    noEvaluation: boolean;
    width: string;
  }
  export class audioRecorder {
    localId: string;
  }
  export class snapshotField {
    localId: string;
  }
  export class scormField {
    localId: string;
    scormTitle: string;
    packageId: string;
    width: string;
    height: string;
  }
  export class mathWorksheet {
    e_equationEditor: documents.equationEditor[];
    e_application: documents.application;
    extended: documents.extendedElement;
    canGenerate: boolean;
    twoColumns: boolean;
    mixFields: boolean;
    localId: string;
  }
  export class questionAssistants {
    alternative: string;
    example: string;
    hint: string;
    assistant1: string;
    assistant2: string;
    assistant3: string;
    alwaysShow: boolean;
    alwaysShowSpecified: boolean;
    teacherhelp: boolean;
    teacherhelpSpecified: boolean;
  }
  export class googleDoc {
    localId: string;
    docTitle: string;
    questionId: string;
    docId: string;
    docUrl: string;
    emptyTemplateType: string;
    sharingType: string;
    width: string;
    height: string;
    display: documents.gdDisplay;
  }
  export enum gdDisplay {
    link,
    embed,
  }
  export enum templateType {
    openQuestion,
    multipleChoice,
    touchNGoSingleChoice,
    clozeQuestion,
    veryClozeQuestion,
    extendedClozeQuestion,
    sharedClozeQuestion,
    docPreface,
    cetContentQuestion,
    mathGeneratorQuestion,
    scormQuestion,
    pdfViewer,
    embedUrl,
    googleDocQuestion,
    videoQuiz,
    hotspots,
    exploreImage,
    textit,
    textMarker,
    unseen,
    sandbox,
    sharequestion,
    ordering,
    dragndrop,
    dragndropwithoutgroups,
    Dot2Dot,
    trivia,
    winningWheel,
    tetris,
    numberscritters,
    monsterblocks,
    rangetemplate,
    stripsanddisks,
    coordinatesystemtemplate,
    numberlinetemplate,
    toystore,
  }
  export class staticContent {
    backgroundStyle: documents.backgroundStyle;
    htmlContent: string;
    elementId: string;
    name: string;
    type: documents.templateType;
    typeSpecified: boolean;
    order: number;
    themeClass: string;
    zoneId: string;
  }
  export class baseZone {
    localId: string;
    layoutId: string;
    width: string;
    hight: string;
    top: string;
    right: string;
    bottom: string;
    left: string;
  }
  export enum pageTransitionType {
    none,
    horizontal,
    vertical,
  }
  export class progressBar {
  }
  export class popupContent {
    message: string;
  }
  export class popup {
    cssClass: string;
    title: string;
  }
  export class paginationItem {
    localId: string;
    label: string;
    href: string;
  }
  export class pagination {
    instructionsPage: documents.paginationItem;
    page: documents.paginationItem[];
    studentSubmitPage: documents.paginationItem;
    teacherSubmitPage: documents.paginationItem;
    extended: documents.extendedElement;
    pageTransition: documents.pageTransitionType;
  }
  export class pagePlayer {
    extended: documents.extendedElement;
    localId: string;
    pageTransition: documents.pageTransitionType;
    course: string;
    scope: string;
    engineId: string;
    engineType: documents.pagePlayerEngineType;
  }
  export enum pagePlayerEngineType {
    adaptive,
    linear,
  }
  export class networkUnavailable {
    reason: documents.reason;
  }
  export enum reason {
    offline,
    cetServersOff,
  }
  export class noPermission {
  }
  export class menubarMobile {
    title: string;
    localId: string;
    showUserDetails: boolean;
    showSchoolPicker: boolean;
    showViewAsTeacher: boolean;
    showViewAsStudent: boolean;
    showDisconnectButton: boolean;
    showConnectButton: boolean;
    showStudentSubmitButton: boolean;
    showTeacherAttachButton: boolean;
    showCheckFinishedButton: boolean;
    showStudentNameOnMenuTitle: boolean;
    showShowScoreButton: boolean;
    showRetryButton: boolean;
    showUpdateFeedbackButton: boolean;
    hideLogo: boolean;
  }
  export class menubar {
    extended: documents.extendedElement;
    title: string;
    hideLogo: boolean;
    localId: string;
  }
  export class htmlFragment {
    htmlContent: string;
    localId: string;
  }
  export class keyboard {
    cssClass: string;
    localId: string;
  }
  export class gallery {
    childElementId: string;
    defaultView: documents.galleryView;
    orderBy: documents.galleryOrderBy;
    showAllStudents: boolean;
    localId: string;
  }
  export enum galleryView {
    full,
    thumbnail,
  }
  export enum galleryOrderBy {
    name,
    time,
  }
  export class feedback {
    studentIndicator: string;
    extended: documents.extendedElement;
    notAnsweredFeedback: documents.notAnsweredFeedback;
  }
  export enum notAnsweredFeedback {
    ignore,
    show,
    hide,
  }
  export class donutChart {
  }
  export class buttonIcon {
    cssClass: string;
    svg: string;
  }
  export class button {
    icon: documents.buttonIcon;
    localId: string;
    text: string;
    cssClass: string;
    action: string;
    value: string;
    description: string;
    disabled: boolean;
    disabledSpecified: boolean;
  }
  export class atlas {
    localId: string;
    mapID: string;
  }
  export class baseResource {
    src: string;
    width: string;
    height: string;
    name: string;
  }
  export class video extends baseResource {
    type: string;
    controls: string;
  }
  export class image extends baseResource {
    title: string;
    alt: string;
  }
  export class iframe extends baseResource {
    scrolling: string;
    frameBorder: string;
    allowFullScreen: boolean;
    allowFullScreenSpecified: boolean;
  }
  export class audio extends baseResource {
    native: boolean;
    controls: string;
    localId: string;
  }
  export class anchor extends baseResource {
    addionalElements: string;
    text: string;
    htmlFragment: string;
    target: string;
  }
  export class DocumentModel {
    e_baseResource: documents.baseResource;
    e_application: documents.application;
    e_anchor: documents.anchor;
    e_audio: documents.audio;
    e_audioRecorder: documents.audioRecorder;
    e_applicationZone: documents.applicationZone;
    e_atlas: documents.atlas;
    baseZone: documents.baseZone;
    e_button: documents.button;
    e_carouselZone: documents.baseZone;
    e_cloze: documents.cloze;
    e_donutChart: documents.donutChart;
    e_dropdown: documents.dropdown;
    e_dropdownField: documents.dropdownField;
    e_dropdownMenu: documents.dropdown;
    e_equationEditor: documents.equationEditor;
    e_feedback: documents.feedback;
    e_gallery: documents.gallery;
    e_geoboard: documents.geoboard;
    e_geogebra: documents.geogebra;
    e_googleDoc: documents.googleDoc;
    e_keyboard: documents.keyboard;
    e_iframe: documents.iframe;
    e_interactiveContent: documents.question;
    e_image: documents.image;
    e_htmlFragment: documents.htmlFragment;
    e_mathWorksheet: documents.mathWorksheet;
    e_multiChoice: documents.multiChoice;
    e_menubar: documents.menubar;
    e_menubarMobile: documents.menubarMobile;
    e_noPermission: documents.noPermission;
    e_networkUnavailable: documents.networkUnavailable;
    e_option: documents.option;
    e_page: documents.page;
    e_pagePlayer: documents.pagePlayer;
    e_pagination: documents.pagination;
    e_popup: documents.popup;
    e_popupContent: documents.popupContent;
    e_progressBar: documents.progressBar;
    e_question: documents.question;
    e_questionFeedback: documents.feedback;
    e_questionAssistants: documents.questionAssistants;
    e_questionnaire: documents.questionnaire;
    e_richTextEditor: documents.richTextEditor;
    e_richTextField: documents.richTextField;
    e_scormField: documents.scormField;
    e_singleAutofitZone: documents.baseZone;
    e_singleChoice: documents.multiChoice;
    e_tabPanel: documents.TabPanel;
    e_tabs: documents.Tabs;
    e_staticContent: documents.staticContent;
    e_sideMenu: documents.sideMenu;
    e_snackbarMessages: documents.snackbarMessages;
    e_snapshotField: documents.snapshotField;
    e_textField: documents.textField;
    e_verticalScrollZone: documents.baseZone;
    e_video: documents.video;
    e_videoZone: documents.videoZone;
    e_gameZone: documents.gameZone;
  }
  export enum WorkflowStep {
    characterization,
    development,
    grammaticalEdit,
    testing,
    technologyApproval,
    publishApproval,
    other,
  }
}
export = documents;