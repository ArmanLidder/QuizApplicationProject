import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { GameAdministrationPageComponent } from '@app/pages/game-administration-page/game-administration-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';
import { QuizCreationComponent } from '@app/components/quiz-creation/quiz-creation.component';
import { PasswordPromptComponent } from '@app/components/password-prompt/password-prompt.component';
import { GameItemComponent } from '@app/components/game-item/game-item.component';
import { GamesListComponent } from '@app/components/games-list/games-list.component';
import { QuizInfoComponent } from '@app/components/quiz-info/quiz-info.component';
import { UniqueQuizErrorFeedbackComponent } from '@app/components/unique-quiz-error-feedback/unique-quiz-error-feedback.component';
import { ValidationQuizErrorFeedbackComponent } from '@app/components/validation-quiz-error-feedback/validation-quiz-error-feedback.component';
import { WaitingRoomComponent } from '@app/components/waiting-room/waiting-room.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { WaitingRoomPlayerPageComponent } from '@app/pages/waiting-room-player-page/waiting-room-player-page.component';
import { RoomCodePromptComponent } from '@app/components/room-code-prompt/room-code-prompt.component';
import { GameInterfaceComponent } from '@app/components/game-interface/game-interface.component';
import { GameAnswersListComponent } from '@app/components/game-answers-list/game-answers-list.component';
import { GameAnswerChoiceCardComponent } from '@app/components/game-answer-choice-card/game-answer-choice-card.component';
import { HostInterfaceComponent } from '@app/components/host-interface/host-interface.component';
import { OrganizerHistogramComponent } from '@app/components/organizer-histogram/organizer-histogram.component';
import { NgChartsModule } from 'ng2-charts';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise, Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        SidebarComponent,
        QuizCreationComponent,
        QuizCreationPageComponent,
        QuestionListComponent,
        GameCreationPageComponent,
        GameAdministrationPageComponent,
        PasswordPromptComponent,
        GameItemComponent,
        GamesListComponent,
        QuizInfoComponent,
        UniqueQuizErrorFeedbackComponent,
        ValidationQuizErrorFeedbackComponent,
        WaitingRoomComponent,
        WaitingRoomHostPageComponent,
        WaitingRoomPlayerPageComponent,
        RoomCodePromptComponent,
        GameInterfaceComponent,
        GameAnswersListComponent,
        GameAnswerChoiceCardComponent,
        HostInterfaceComponent,
        OrganizerHistogramComponent,
        PlayerListComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        NgChartsModule,
        BrowserAnimationsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
