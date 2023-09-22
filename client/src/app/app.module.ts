import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { QuestionListComponent } from './components/question/question-list.component';
import { GameAdministrationPageComponent } from './pages/game-administration-page/game-administration-page.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';
import { QuizCreationComponent } from '@app/components/quiz-creation/quiz-creation.component';
import { PasswordPromptComponent } from '@app/components/password-prompt/password-prompt.component';
import { GameItemComponent } from '@app/components/game-item/game-item.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { QuizInfoComponent } from './components/quiz-info/quiz-info.component';
import { QuizTestingPageComponent } from './pages/quiz-testing-page/quiz-testing-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { AnswerChoiceCardComponent } from './components/answer-choice-card/answer-choice-card.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        AnswerChoiceCardComponent,
        QuizCreationComponent,
        QuizCreationPageComponent,
        QuestionListComponent,
        GameCreationPageComponent,
        GameAdministrationPageComponent,
        PasswordPromptComponent,
        GameItemComponent,
        GamesListComponent,
        QuizInfoComponent,
        QuizTestingPageComponent,
        WaitingRoomPageComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
